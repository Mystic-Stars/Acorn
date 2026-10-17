import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getNoteAnchor, selectNotes } from '../../src/lib/note-list.ts';
import { getNotePreview } from '../../src/lib/note-preview.ts';

const note = (id, day, draft = false) => ({
  id,
  data: { pubDate: new Date(`2026-01-${String(day).padStart(2, '0')}`), draft },
});
test('public notes exclude drafts and sort deterministically without mutating source', () => {
  const entries = [note('older', 1), note('draft', 31, true), note('b', 2), note('a', 2)];
  assert.deepEqual(
    selectNotes(entries).map((entry) => entry.id),
    ['a', 'b', 'older'],
  );
  assert.equal(entries[0].id, 'older');
  assert.deepEqual(selectNotes([note('private', 1, true)]), []);
});

test('development explicitly includes drafts while production selection stays private', () => {
  const entries = [note('published', 1), note('draft', 2, true)];
  assert.deepEqual(
    selectNotes(entries, true).map((entry) => entry.id),
    ['draft', 'published'],
  );
  assert.deepEqual(
    selectNotes(entries, false).map((entry) => entry.id),
    ['published'],
  );
});

test('note anchors support Unicode and nested IDs, and route collisions fail clearly', () => {
  assert.equal(getNoteAnchor('日常/春天'), 'note-日常/春天');
  for (const id of ['rss', 'page', 'page/2']) {
    assert.throws(() => selectNotes([note(id, 1)]), /reserved route/);
  }
});

test('note previews use the first real Markdown image and resolve references', () => {
  assert.deepEqual(
    getNotePreview('```\n![not an image](/fake.png)\n```\n![Photo](/images/photo.webp)'),
    { src: '/images/photo.webp', alt: 'Photo' },
  );
  assert.deepEqual(getNotePreview('![Photo][picture]\n\n[picture]: /images/reference.png'), {
    src: '/images/reference.png',
    alt: 'Photo',
  });
  assert.equal(getNotePreview('Just a note without images.'), undefined);
  assert.equal(getNotePreview('![Unsafe](javascript:alert)'), undefined);
});
