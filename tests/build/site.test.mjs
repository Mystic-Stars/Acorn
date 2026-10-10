import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { loadEnv } from 'vite';
import { homeConfig } from '../../src/config/content.ts';
import { siteConfig } from '../../src/config/site.ts';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = new URL(process.env.SITE_URL ?? env.SITE_URL ?? 'https://example.com').origin;
const documents = JSON.parse(await readFile('dist/search-index.json', 'utf8'));
const readPage = async (path) => {
  const dom = new JSDOM(await readFile(path, 'utf8'));
  return dom.window.document;
};

test('every home page contains only its own slice and real pagination links', async () => {
  const pageSize = homeConfig.pagination.pageSize;
  const totalPages = Math.max(1, Math.ceil(documents.length / pageSize));
  const hrefs = [];
  for (let page = 1; page <= totalPages; page += 1) {
    const path = page === 1 ? 'dist/index.html' : `dist/page/${page}/index.html`;
    const document = await readPage(path);
    const cards = Array.from(document.querySelectorAll('[data-post-card]'));
    assert.equal(
      cards.length,
      Math.min(pageSize, Math.max(0, documents.length - (page - 1) * pageSize)),
    );
    assert.equal(document.querySelectorAll('[data-post-card][hidden]').length, 0);
    hrefs.push(...cards.map((card) => card.querySelector('h2 a').getAttribute('href')));
    assert.ok(
      document
        .querySelector('[data-feed-count]')
        .textContent.includes(`第 ${page}/${totalPages} 页`),
    );
    if (page < totalPages) {
      assert.equal(
        document.querySelector('[data-pagination] a[rel="next"]').getAttribute('href'),
        `/page/${page + 1}/`,
      );
    }
    if (page > 1) {
      assert.equal(
        document.querySelector('[data-pagination] a[rel="prev"]').getAttribute('href'),
        page === 2 ? '/' : `/page/${page - 1}/`,
      );
    }
  }
  assert.deepEqual(
    hrefs,
    documents.map((post) => post.href),
  );
});

test('category navigation points to shareable archive filters', async () => {
  const document = await readPage('dist/index.html');
  for (const link of document.querySelectorAll('.topic-tabs a:not([aria-current])')) {
    const url = new URL(link.getAttribute('href'), site);
    assert.equal(url.pathname, '/archives/');
    assert.ok(url.searchParams.get('category'));
  }
});

test('canonical, RSS and robots use the configured site', async () => {
  const document = await readPage('dist/index.html');
  assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'), `${site}/`);
  assert.ok((await readFile('dist/robots.txt', 'utf8')).includes(`${site}/sitemap-index.xml`));
  const rss = new JSDOM(await readFile('dist/rss.xml', 'utf8'), { contentType: 'text/xml' });
  assert.equal(rss.window.document.querySelector('channel > link').textContent, `${site}/`);
});

test('management pages are noindex and excluded from Sitemap', async () => {
  const sitemap = await readFile('dist/sitemap-0.xml', 'utf8');
  assert.ok(!sitemap.includes('/manage-comments/'));
  assert.ok(!sitemap.includes('/404'));
  const document = await readPage('dist/manage-comments/index.html');
  assert.ok(
    document.querySelector('meta[name="robots"]').getAttribute('content').includes('noindex'),
  );
});

test('site age exposes the configured date and timezone for runtime refresh', async () => {
  const document = await readPage('dist/index.html');
  const counter = document.querySelector('[data-site-age]');
  assert.equal(counter.dataset.siteAge, siteConfig.establishedAt);
  assert.equal(counter.dataset.siteAgeTimeZone, siteConfig.date.options.timeZone);
});
