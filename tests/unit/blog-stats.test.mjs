import assert from 'node:assert/strict';
import { test } from 'node:test';
import { countContentWords } from '../../src/lib/blog-stats.ts';

test('word counts exclude code and count visible link text', () => {
  assert.equal(countContentWords('中文 [two words](https://example.com) `excluded`'), 4);
  assert.equal(countContentWords('~~~js\nexcluded code\n~~~'), 0);
});
