import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import sharp from 'sharp';
import rehypeLocalImages from '../../src/plugins/rehype-local-images.mjs';
import { withTempWorkspace } from '../helpers/temp-workspace.mjs';

const image = (src, properties = {}) => ({
  type: 'element',
  tagName: 'img',
  properties: { src, ...properties },
  children: [],
});

test('local image headers supply intrinsic size without touching author settings or fetching remote URLs', async () => {
  await withTempWorkspace(async (root) => {
    await mkdir(join(root, 'public'));
    await writeFile(
      join(root, 'public', 'photo.png'),
      await sharp({
        create: { width: 64, height: 32, channels: 3, background: '#f7f3df' },
      })
        .png()
        .toBuffer(),
    );
    const images = [
      image('/photo.png'),
      image('/photo.png?version=1'),
      image('/photo.png', { width: 10, height: 5, loading: 'eager', decoding: 'sync' }),
      image('https://example.com/photo.png'),
      image('/missing.png'),
      image('/%E0%A4%A.png'),
    ];
    const transform = rehypeLocalImages({ publicDirectory: join(root, 'public') });
    await transform({ type: 'root', children: images });
    for (const node of images.slice(0, 2)) {
      assert.equal(node.properties.width, 64);
      assert.equal(node.properties.height, 32);
      assert.equal(node.properties.loading, 'lazy');
      assert.equal(node.properties.decoding, 'async');
    }
    assert.equal(images[2].properties.width, 10);
    assert.equal(images[2].properties.loading, 'eager');
    assert.equal(images[2].properties.decoding, 'sync');
    for (const node of images.slice(3)) assert.equal(node.properties.width, undefined);
  });
});

test('local image metadata cannot read beyond the public root', async () => {
  await withTempWorkspace(async (root) => {
    await mkdir(join(root, 'public'));
    await writeFile(
      join(root, 'outside.png'),
      await sharp({
        create: { width: 8, height: 8, channels: 3, background: '#f7f3df' },
      })
        .png()
        .toBuffer(),
    );
    const images = [
      image('/../outside.png'),
      image('/%2e%2e/outside.png'),
      image('/%2e%2e%5coutside.png'),
      image('//example.com/photo.png'),
    ];
    await rehypeLocalImages({ publicDirectory: join(root, 'public') })({
      type: 'root',
      children: images,
    });
    for (const node of images) assert.equal(node.properties.width, undefined);
  });
});
