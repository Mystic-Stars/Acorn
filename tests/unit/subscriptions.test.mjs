import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createFeedItems } from '../../src/lib/subscriptions.ts';
import { getPagination } from '../../src/lib/pagination.ts';

test('feeds exclude drafts even when passed development collections', () => {
  const entries = [
    { id: 'older', data: { pubDate: new Date('2024-01-01'), tags: ['Web', 'Web'] } },
    { id: 'draft', data: { pubDate: new Date('2026-01-01'), tags: [], draft: true } },
    { id: 'newer', data: { pubDate: new Date('2025-01-01'), tags: [] } },
  ];
  const items = createFeedItems(entries, (entry) => ({
    title: entry.id,
    description: 'Text',
    link: `/notes/${entry.id}/`,
  }));
  assert.deepEqual(
    items.map((item) => item.title),
    ['newer', 'older'],
  );
  assert.deepEqual(items[1].categories, ['Web']);
  assert.deepEqual(
    createFeedItems([], () => {}),
    [],
  );
  assert.equal(entries[0].id, 'older');
});

test('pagination covers empty, exact boundaries and final partial pages', () => {
  assert.deepEqual(getPagination(0, 10), { totalPages: 1, start: 0, end: 10 });
  assert.deepEqual(getPagination(20, 10, 2), { totalPages: 2, start: 10, end: 20 });
  assert.deepEqual(getPagination(21, 10, 3), { totalPages: 3, start: 20, end: 30 });
  assert.throws(() => getPagination(10, 0));
  assert.throws(() => getPagination(10, 10, 2));
});
