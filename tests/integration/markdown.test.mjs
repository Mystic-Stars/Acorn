import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { articleReaderConfig, articleMarkdownConfig } from '../../src/config/content.ts';
import { createArticleMarkdownOptions } from '../../src/plugins/markdown.mjs';
import { markdownToSearchText } from '../../src/lib/search.ts';

const renderer = await createMarkdownProcessor(
  createArticleMarkdownOptions(articleReaderConfig, articleMarkdownConfig),
);
const render = async (source) => {
  const result = await renderer.render(source);
  const dom = new JSDOM(result.code);
  return { ...result, document: dom.window.document, dom };
};

test('CJK punctuation emphasis renders in headings, paragraphs, links and search', async () => {
  const source =
    '## **¶**版权声明\n\n正文**中文。**继续，*（备注）*中文，~~过时。~~继续。\n\n[**标题！**链接](https://example.com)';
  const { document, metadata, dom } = await render(source);
  assert.equal(document.querySelector('h2 strong').textContent, '¶');
  assert.deepEqual(metadata.headings, [{ depth: 2, slug: '版权声明', text: '¶版权声明' }]);
  assert.equal(document.querySelector('p strong').textContent, '中文。');
  assert.equal(document.querySelector('em').textContent, '（备注）');
  assert.equal(document.querySelector('del').textContent, '过时。');
  assert.equal(document.querySelector('a strong').textContent, '标题！');
  assert.ok(!markdownToSearchText(source).includes('**'));
  dom.window.close();
});

test('escaped markers and inline/fenced code stay literal and preserve whitespace', async () => {
  const { document, dom } = await render(
    [
      '\\*\\*¶\\*\\*版权声明 `**中文。**`',
      '',
      '```text',
      '    **¶**版权声明',
      '      第二行',
      '```',
    ].join('\n'),
  );
  assert.equal(document.querySelectorAll('strong').length, 0);
  assert.equal(document.querySelector('p code').textContent, '**中文。**');
  assert.equal(document.querySelector('pre code').textContent, '    **¶**版权声明\n      第二行');
  assert.equal(document.querySelector('.article-code-language').textContent, '纯文本');
  assert.ok(document.querySelector('[data-code-copy]').hidden);
  dom.window.close();
});

test('GFM tables render through the library before JS with alignment and rich cells intact', async () => {
  const { document, dom } = await render(
    [
      '| 左侧 | 居中 | 右侧 |',
      '| :-- | :-: | --: |',
      '| **中文。**内容 | [链接](https://example.com) | `123` |',
      '| 转义 \\| 管道 | ~~旧。~~内容 | 空 |',
    ].join('\n'),
  );
  const region = document.querySelector('[data-markdown-table]');
  assert.equal(region.getAttribute('role'), 'region');
  assert.equal(region.tabIndex, 0);
  assert.ok(document.querySelector('table.article-animal-table'));
  assert.deepEqual(
    [...document.querySelectorAll('th')].map((cell) => cell.style.textAlign),
    ['left', 'center', 'right'],
  );
  assert.ok([...document.querySelectorAll('th')].every((cell) => cell.scope === 'col'));
  assert.equal(document.querySelector('td strong').textContent, '中文。');
  assert.equal(document.querySelector('td a').getAttribute('href'), 'https://example.com');
  assert.equal(document.querySelector('td code').textContent, '123');
  assert.equal(document.querySelectorAll('tbody tr').length, 2);
  assert.ok(document.querySelector('tbody').textContent.includes('转义 | 管道'));
  assert.equal(document.querySelectorAll('astro-island, script').length, 0);
  dom.window.close();
});

test('hand-written HTML tables keep captions, attributes and spanning cells', async () => {
  const { document, dom } = await render(
    '<table id="authored"><caption>说明</caption><tbody><tr><td colspan="2">合并</td></tr></tbody></table>',
  );
  assert.ok(document.querySelector('[data-markdown-table] #authored'));
  assert.equal(document.querySelector('caption').textContent, '说明');
  assert.equal(document.querySelector('td').colSpan, 2);
  dom.window.close();
});

test('HTML table cell and row IDs are preserved for authored anchors', async () => {
  const { document, dom } = await render(
    '<table><thead><tr><th id="column">说明</th></tr></thead><tbody><tr id="row"><td headers="column">正文</td></tr></tbody></table>',
  );
  assert.ok(document.getElementById('column'));
  assert.ok(document.getElementById('row'));
  assert.equal(document.querySelector('td').getAttribute('headers'), 'column');
  dom.window.close();
});

test('nested lists, tasks, footnotes and repeated heading IDs retain their semantics', async () => {
  const { document, metadata, dom } = await render(
    [
      '## 重复',
      '',
      '## 重复',
      '',
      '- [x] 完成',
      '- [ ] 待办',
      '  - 子项',
      '',
      '引用[^note]。再次引用[^note]。',
      '',
      '[^note]: **中文。**注释',
    ].join('\n'),
  );
  assert.deepEqual(
    metadata.headings.map((heading) => heading.slug),
    ['重复', '重复-1', 'footnote-label'],
  );
  assert.ok(document.querySelector('input[type="checkbox"]:checked[disabled]'));
  assert.ok(document.querySelector('li ul li'));
  assert.equal(document.querySelector('[data-footnotes] h2').textContent, '注释');
  const refs = [...document.querySelectorAll('[data-footnote-ref]')];
  assert.equal(refs.length, 2);
  for (const ref of refs) {
    assert.ok(document.getElementById(decodeURIComponent(ref.hash.slice(1))));
  }
  assert.ok(
    document
      .querySelector('[data-footnote-backref]')
      .getAttribute('aria-label')
      .includes('返回正文引用'),
  );
  dom.window.close();
});

test('unlabelled image-only headings remain images without adding blank TOC entries', async () => {
  const { document, metadata, dom } = await render(
    '##\n\n### ![](/images/illustration.png)\n\n## 正文\n',
  );
  assert.deepEqual(metadata.headings, [{ depth: 2, slug: '正文', text: '正文' }]);
  assert.equal(document.querySelectorAll('h3').length, 0);
  assert.ok(document.querySelector('p img'));
  dom.window.close();
});

test('code toolbars use declared languages and never alter source indentation', async () => {
  const { document, dom } = await render(
    '```python\n    print("你好")\n      print("世界")\n```\n\n```\n{"key": 1}\n```\n',
  );
  assert.deepEqual(
    [...document.querySelectorAll('.article-code-language')].map((el) => el.textContent),
    ['Python', 'JSON'],
  );
  assert.equal(
    document.querySelector('pre code').textContent,
    '    print("你好")\n      print("世界")',
  );
  assert.equal(document.querySelectorAll('.article-code-toolbar').length, 2);
  assert.equal(document.querySelectorAll('pre .article-code-toolbar').length, 0);
  assert.ok([...document.querySelectorAll('pre')].every((pre) => pre.tabIndex === 0));
  dom.window.close();
});

test('copy config removes buttons at build time, while language labels remain', async () => {
  const options = createArticleMarkdownOptions(
    {
      ...articleReaderConfig,
      codeCopy: { ...articleReaderConfig.codeCopy, enabled: false },
    },
    articleMarkdownConfig,
  );
  const disabledRenderer = await createMarkdownProcessor({ ...options, syntaxHighlight: false });
  const result = await disabledRenderer.render('```js\nconst value = 1;\n```');
  const dom = new JSDOM(result.code);
  assert.equal(dom.window.document.querySelectorAll('[data-code-copy]').length, 0);
  assert.equal(
    dom.window.document.querySelector('.article-code-language').textContent,
    'JavaScript',
  );
  dom.window.close();
});

test('historical punctuation headings are fixed without rewriting the Markdown files', async () => {
  const source = await readFile('src/content/blog/speed-vercel.md', 'utf8').catch(() => undefined);
  if (!source) return; // The public theme ships its own example articles.
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const { document, metadata, dom } = await render(body);
  assert.equal(document.querySelector('h2').textContent, '¶版权声明');
  assert.equal(metadata.headings[0].text, '¶版权声明');
  assert.equal(document.querySelector('h2').id, '版权声明');
  assert.ok(
    [...document.querySelectorAll('img')].every((image) => image.width > 0 && image.height > 0),
  );
  dom.window.close();
});
