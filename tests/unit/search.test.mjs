import assert from 'node:assert/strict';
import { test } from 'node:test';
import { markdownToSearchText, createSearchDocument } from '../../src/lib/search.ts';

test('search preserves linked, reference-linked and formatted text', () => {
  const markdown = [
    '# Heading',
    '[Visible knowledge](https://example.com/path_(nested))',
    '[Reference knowledge][ref]',
    '**bold** and `inlineCode`',
    '',
    '[ref]: https://example.com/reference',
    '',
    '![Excluded image](https://example.com/image.png)',
    '```js',
    'excludedCode()',
    '```',
    '~~~',
    'excludedTildeCode',
    '~~~',
    '',
    '| Column | Other |',
    '| --- | --- |',
    '| searchable | value |',
  ].join('\n');
  const text = markdownToSearchText(markdown);
  for (const expected of [
    'Heading',
    'Visible knowledge',
    'Reference knowledge',
    'bold',
    'inlineCode',
    'searchable',
  ]) {
    assert.ok(text.includes(expected), `missing ${expected}`);
  }
  for (const excluded of ['https://', 'Excluded image', 'excludedCode', 'excludedTildeCode']) {
    assert.ok(!text.includes(excluded), `unexpected ${excluded}`);
  }
  assert.equal(markdownToSearchText('front**middle**end'), 'frontmiddleend');
  assert.equal(markdownToSearchText('first  \nsecond'), 'first second');
});

test('search documents preserve metadata and support an empty body', () => {
  const post = { data: { title: 'Title', description: 'Description', tags: ['Tag'] } };
  assert.deepEqual(createSearchDocument(post, '/article/'), {
    title: 'Title',
    description: 'Description',
    tags: ['Tag'],
    category: '',
    content: '',
    href: '/article/',
  });
});
