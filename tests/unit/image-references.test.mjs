import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import {
  imageReferences,
  promoteLocalCover,
  publicImageFile,
  replaceImageReferences,
} from '../../scripts/images/references.mjs';

test('image extraction handles frontmatter, inline, linked, reference and HTML images, not code', () => {
  const source = [
    '---',
    'cover: { tone: mint, url: "https://example.com/cover.webp" }',
    '---',
    '[![Screenshot](https://example.com/screen.png)](https://example.com/screen.png)',
    '![Reference][photo]',
    '',
    '[photo]: https://example.com/ref.png "Title"',
    '',
    '<img src="https://example.com/html.png?a=1&amp;b=2" alt="HTML">',
    '',
    '[Normal link](https://example.com/page)',
    '[![Badge](/images/badge.svg)](https://example.com/project)',
    '`![Code](https://example.com/code.png)`',
    '```md',
    '![Example](https://example.com/example.png)',
    '```',
  ].join('\n');
  const { refs } = imageReferences(source, 'blog');
  assert.deepEqual(
    refs.map((ref) => ref.url).sort(),
    [
      'https://example.com/cover.webp',
      'https://example.com/html.png?a=1&b=2',
      'https://example.com/ref.png',
      'https://example.com/screen.png',
      'https://example.com/screen.png',
      '/images/badge.svg',
    ].sort(),
  );
  const migrated = replaceImageReferences(
    source,
    refs.map((ref) => ({ ...ref, url: '/images/local.png' })),
  );
  assert.ok(migrated.includes('[![Screenshot](/images/local.png)](/images/local.png)'));
  assert.ok(migrated.includes('[photo]: /images/local.png "Title"'));
  assert.ok(migrated.includes('<img src="/images/local.png" alt="HTML">'));
  assert.ok(migrated.includes('![Example](https://example.com/example.png)'));
  assert.ok(migrated.includes('[Normal link](https://example.com/page)'));
  assert.ok(migrated.includes('[![Badge](/images/local.png)](https://example.com/project)'));
});

test('migration preserves CRLF, YAML comments, prose and historical dates', () => {
  const source =
    "---\r\npubDate: 2024-01-01\r\ncover:\r\n  url: 'https://example.com/a.webp' # keep\r\n---\r\nText\r\n";
  const { refs } = imageReferences(source, 'blog');
  const migrated = promoteLocalCover(
    replaceImageReferences(
      source,
      refs.map((ref) => ({ ...ref, url: '/images/posts/story/cover.webp' })),
    ),
  );
  assert.equal(
    migrated,
    '---\r\npubDate: 2024-01-01\r\ncover:\r\n  upload: "/images/posts/story/cover.webp" # keep\r\n---\r\nText\r\n',
  );
});

test('cover promotion does not overwrite an existing uploaded cover', () => {
  const source = '---\ncover: { url: /images/old.png, upload: /images/new.png }\n---\n';
  assert.equal(promoteLocalCover(source), source);
});

test('cover promotion preserves the precedence of an imported Astro asset', () => {
  const source = '---\ncover: { url: /images/old.png, image: ../../assets/cover.png }\n---\n';
  assert.equal(promoteLocalCover(source), source);
});

test('public image resolution rejects traversal, network paths and malformed escapes', () => {
  const root = resolve('fixture');
  assert.equal(
    publicImageFile(root, '/images/photo.png?v=1#preview'),
    resolve(root, 'public/images/photo.png'),
  );
  for (const path of [
    '//example.com/image.png',
    '/../secret.png',
    '/images/%2e%2e/secret.png',
    '/images/%5csecret.png',
    '/images/%00.png',
    '/images/%zz.png',
    'images/a.png',
  ]) {
    assert.throws(() => publicImageFile(root, path), undefined, path);
  }
});
