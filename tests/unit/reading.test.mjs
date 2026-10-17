import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getPostNeighbors, getRelatedPosts, validateReadingGraph } from '../../src/lib/reading.ts';

const post = (id, options = {}) => ({
  id,
  data: { pubDate: new Date('2026-01-01'), tags: [], draft: false, ...options },
});

test('neighbors use chronological order, deterministic ties, and never drafts', () => {
  const oldest = post('old', { pubDate: new Date('2025-01-01') });
  const current = post('current');
  const latest = post('latest', { pubDate: new Date('2026-02-01') });
  const draft = post('draft', { draft: true });
  const posts = [oldest, draft, latest, current];
  assert.deepEqual(getPostNeighbors(current, posts), { previous: oldest, next: latest });
  assert.equal(getPostNeighbors(latest, posts).next, undefined);
  assert.equal(getPostNeighbors(oldest, posts).previous, undefined);
  assert.deepEqual(getPostNeighbors(draft, posts), { previous: undefined, next: undefined });
  assert.equal(posts[0], oldest, 'input order must not change');
});

test('recommendations prioritize manual choices, deduplicate and score shared tags', () => {
  const current = post('current', {
    tags: ['Astro'],
    category: 'Web',
    relatedPosts: ['manual', 'manual', 'current', 'draft'],
  });
  const manual = post('manual');
  const tagged = post('tagged', { tags: ['astro', 'ASTRO'] });
  const category = post('category', { category: 'Web' });
  const unrelated = post('unrelated');
  const draft = post('draft', { draft: true, tags: ['Astro'] });
  assert.deepEqual(
    getRelatedPosts(current, [current, category, unrelated, draft, tagged, manual]),
    [manual, tagged, category],
  );
  assert.deepEqual(getRelatedPosts(current, [current, tagged, manual], 1), [manual]);
  assert.deepEqual(getRelatedPosts(current, [unrelated]), []);
  assert.deepEqual(getRelatedPosts(draft, [current]), []);
  assert.deepEqual(getRelatedPosts(current, [tagged], 0), []);
});

test('graph rejects missing links and self-references, allowing known draft links', () => {
  assert.throws(
    () => validateReadingGraph([post('a', { relatedPosts: ['missing'] })]),
    /missing post/,
  );
  assert.throws(() => validateReadingGraph([post('a', { relatedPosts: ['a'] })]), /itself/);
  assert.doesNotThrow(() =>
    validateReadingGraph([post('a', { relatedPosts: ['b'] }), post('b', { draft: true })]),
  );
});
