import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { articleReaderConfig } from '../../src/config/content.ts';

const posts = JSON.parse(await readFile('dist/search-index.json', 'utf8'));

test('production articles contain complete static Markdown and consistent TOC links', async () => {
  for (const post of posts) {
    const dom = new JSDOM(await readFile(`dist${post.href}index.html`, 'utf8'));
    const document = dom.window.document;
    const prose = document.querySelector('.prose');
    assert.ok(prose, post.href);
    for (const heading of prose.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
      assert.ok(!heading.textContent.includes('**¶**'), `${post.href}: unresolved emphasis`);
    }
    for (const link of document.querySelectorAll('[data-toc-link]')) {
      const heading = document.getElementById(link.dataset.tocTarget);
      assert.ok(heading, `${post.href}: missing TOC target`);
      assert.equal(link.textContent.trim(), heading.textContent.trim(), post.href);
    }
    for (const table of prose.querySelectorAll('table')) {
      assert.ok(table.closest('[data-markdown-table]'), `${post.href}: unwrapped table`);
    }
    for (const pre of prose.querySelectorAll('pre')) {
      const code = pre.querySelector(':scope > code');
      if (!code) continue;
      const block = pre.closest('.article-code-block');
      assert.ok(block?.querySelector('.article-code-toolbar'), `${post.href}: missing toolbar`);
      if (articleReaderConfig.codeCopy.enabled) {
        assert.ok(block.querySelector('[data-code-copy][hidden]'));
      }
    }
    assert.equal(prose.querySelectorAll('astro-island').length, 0, post.href);
    assert.ok(
      ![...document.querySelectorAll('astro-island')].some((island) =>
        /MarkdownTable|AnimalMarkdownTable/.test(island.getAttribute('component-url') ?? ''),
      ),
      post.href,
    );
    for (const image of prose.querySelectorAll('img[src^="/images/"]')) {
      assert.ok(image.width > 0 && image.height > 0, `${post.href}: image dimensions missing`);
      assert.equal(image.loading || image.getAttribute('loading'), 'lazy');
    }
    dom.window.close();
  }
});
