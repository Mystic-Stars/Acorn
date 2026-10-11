import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { publicImageFile } from '../../scripts/images/references.mjs';

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith('.html')) files.push(path);
  }
  return files;
}

test('production HTML serves all images from existing local build files', async () => {
  const root = resolve('dist');
  for (const file of await htmlFiles(root)) {
    const dom = new JSDOM(await readFile(file, 'utf8'));
    for (const image of dom.window.document.querySelectorAll('img')) {
      const src = image.getAttribute('src');
      if (!src) continue;
      assert.ok(src?.startsWith('/') && !src.startsWith('//'), `${file}: external image ${src}`);
      const path = publicImageFile(resolve('.'), src);
      const destination = path.replace(resolve('public'), root);
      assert.ok((await stat(destination)).isFile(), `${file}: missing ${src}`);
    }
    dom.window.close();
  }
});
