import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { parse } from 'yaml';
import { notesConfig } from '../../src/config/notes.ts';
import { getPagination } from '../../src/lib/pagination.ts';

const readPage = async (path) =>
  new JSDOM(await readFile(join('dist', path), 'utf8')).window.document;
const posts = JSON.parse(await readFile('dist/search-index.json', 'utf8'));

async function sourceNotes() {
  const files = (await readdir('src/content/notes')).filter((file) => file.endsWith('.md'));
  return Promise.all(
    files.map(async (file) => {
      const text = await readFile(join('src/content/notes', file), 'utf8');
      const data = parse(/^---\r?\n([\s\S]*?)\r?\n---/.exec(text)[1]);
      return { id: file.slice(0, -3).toLowerCase(), data };
    }),
  );
}

test('production articles include only published, unique continuation links', async () => {
  const known = new Set(posts.map((post) => post.href));
  for (const post of posts) {
    const document = await readPage(`${post.href.slice(1)}index.html`);
    const continuation = document.querySelector('[data-article-continuation]');
    assert.ok(continuation);
    for (const link of continuation.querySelectorAll(
      '.post-neighbors a, [data-related-posts] h2 a',
    )) {
      assert.ok(known.has(link.getAttribute('href')));
      assert.notEqual(link.getAttribute('href'), post.href);
    }
    const related = [...continuation.querySelectorAll('[data-related-posts] h2 a')].map((link) =>
      link.getAttribute('href'),
    );
    assert.equal(new Set(related).size, related.length);
    assert.ok(related.length <= 3);
    assert.equal(
      continuation.querySelector('[data-copy-link]').hidden,
      true,
      'copy is progressively enhanced',
    );
  }
});

test('notes paginate independently and drafts have no production pages or feed items', async () => {
  const notes = await sourceNotes();
  const published = notes
    .filter((note) => !note.data.draft)
    .sort(
      (a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate) || a.id.localeCompare(b.id),
    );
  const { totalPages } = getPagination(published.length, notesConfig.pageSize);
  const ids = [];
  for (let page = 1; page <= totalPages; page += 1) {
    const document = await readPage(
      page === 1 ? 'notes/index.html' : `notes/page/${page}/index.html`,
    );
    ids.push(
      ...[...document.querySelectorAll('[data-note-entry]')].map((entry) => entry.dataset.noteId),
    );
    assert.equal(document.querySelectorAll('[data-post-card]').length, 0);
    for (const entry of document.querySelectorAll('[data-note-entry]')) {
      assert.ok(entry.querySelector('[data-note-open]'), 'the list provides a dialog trigger');
      assert.ok(
        entry.querySelector('template').content.querySelector('.note-body'),
        'full Markdown is built before hydration',
      );
    }
    if (page < totalPages)
      assert.equal(
        document.querySelector('[data-notes-pagination] [rel="next"]').getAttribute('href'),
        `/notes/page/${page + 1}/`,
      );
  }
  assert.deepEqual(
    ids,
    published.map((note) => note.id),
  );
  const xml = await readFile('dist/notes/rss.xml', 'utf8');
  const feed = new JSDOM(xml, { contentType: 'text/xml' }).window.document;
  assert.equal(feed.querySelectorAll('item').length, published.length);
  for (const note of notes.filter((entry) => entry.data.draft)) {
    await assert.rejects(readFile(`dist/notes/${note.id}/index.html`));
    assert.ok(!xml.includes(`/notes/${note.id}/`));
  }
  for (const note of published) {
    const document = await readPage(`notes/${note.id}/index.html`);
    assert.ok(document.querySelector('h1').textContent.trim());
    assert.ok(
      document.querySelector('.note-body'),
      'the permanent page works without dialog JavaScript',
    );
    assert.ok(!document.querySelector('meta[http-equiv="refresh"]'));
  }
});

test('every subscription link resolves to valid XML with published article or note permalinks', async () => {
  const document = await readPage('subscribe/index.html');
  const hrefs = [
    ...new Set(
      [...document.querySelectorAll('[data-feed-link] .feed-open')].map((link) =>
        link.getAttribute('href'),
      ),
    ),
  ];
  assert.ok(hrefs.includes('/rss.xml') && hrefs.includes('/notes/rss.xml'));
  for (const href of hrefs) {
    const feed = new JSDOM(await readFile(join('dist', href.slice(1)), 'utf8'), {
      contentType: 'text/xml',
    }).window.document;
    assert.ok(feed.querySelector('rss channel title'));
    for (const link of feed.querySelectorAll('item > link')) {
      const url = new URL(link.textContent);
      await readFile(join('dist', url.pathname.slice(1), 'index.html'));
    }
  }
});

test('notes and subscriptions share the blog layout and no series is published', async () => {
  for (const path of ['notes/index.html', 'subscribe/index.html']) {
    const document = await readPage(path);
    assert.ok(document.querySelector('[data-blog-content] .sidebar'));
    assert.ok(document.querySelector('[data-blog-content] h1'));
    assert.equal(
      document.querySelectorAll('a[href^="/series/"], a[href^="/feeds/series/"]').length,
      0,
    );
  }
  await assert.rejects(readFile('dist/series/index.html'));
});
