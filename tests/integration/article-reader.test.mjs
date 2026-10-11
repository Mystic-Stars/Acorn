import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { enhanceCodeCopy } from '../../src/lib/article-reader.ts';
import { articleReaderConfig } from '../../src/config/content.ts';

function setup() {
  const dom = new JSDOM(
    `<div class="prose"><div class="article-code-block">
    <div class="article-code-toolbar"><button type="button" hidden data-code-copy>复制代码</button>
    <span data-code-copy-status aria-live="polite"></span></div>
    <pre><code>    print("你好")\n      print("世界")</code></pre></div></div>`,
    {
      url: 'https://example.com',
    },
  );
  const prose = dom.window.document.querySelector('.prose');
  const button = prose.querySelector('button');
  const status = prose.querySelector('[data-code-copy-status]');
  return { dom, prose, button, status };
}
const nextTurn = () => new Promise((resolve) => setImmediate(resolve));

test('copy reads only code text, preserves indentation and prevents duplicate requests', async () => {
  const { dom, prose, button, status } = setup();
  let written;
  let calls = 0;
  Object.defineProperty(dom.window.navigator, 'clipboard', {
    value: {
      writeText: async (value) => {
        written = value;
        calls += 1;
      },
    },
  });
  const cleanup = enhanceCodeCopy(prose, articleReaderConfig.codeCopy);
  assert.equal(button.hidden, false);
  button.click();
  button.click();
  await nextTurn();
  assert.equal(calls, 1);
  assert.equal(written, '    print("你好")\n      print("世界")');
  assert.equal(status.textContent, articleReaderConfig.codeCopy.copiedStatus);
  assert.equal(button.textContent, articleReaderConfig.codeCopy.copiedLabel);
  cleanup();
  dom.window.close();
});

test('denied Clipboard API falls back and restores the reader focus', async () => {
  const { dom, prose, button, status } = setup();
  Object.defineProperty(dom.window.navigator, 'clipboard', {
    value: {
      writeText: async () => {
        throw new Error('Denied');
      },
    },
  });
  let fallbackText;
  dom.window.document.execCommand = (command) => {
    assert.equal(command, 'copy');
    fallbackText = dom.window.document.querySelector('textarea').value;
    return true;
  };
  const cleanup = enhanceCodeCopy(prose, articleReaderConfig.codeCopy);
  button.focus();
  button.click();
  await nextTurn();
  assert.equal(fallbackText, prose.querySelector('code').textContent);
  assert.equal(dom.window.document.activeElement, button);
  assert.equal(dom.window.document.querySelector('textarea'), null);
  assert.equal(status.textContent, articleReaderConfig.codeCopy.copiedStatus);
  cleanup();
  dom.window.close();
});

test('failed copy is announced and does not remove or alter the original code', async () => {
  const { dom, prose, button, status } = setup();
  dom.window.document.execCommand = () => false;
  const cleanup = enhanceCodeCopy(prose, articleReaderConfig.codeCopy);
  button.click();
  await nextTurn();
  assert.equal(status.textContent, articleReaderConfig.codeCopy.failedStatus);
  assert.equal(button.textContent, articleReaderConfig.codeCopy.failedLabel);
  assert.equal(prose.querySelector('code').textContent, '    print("你好")\n      print("世界")');
  cleanup();
  dom.window.close();
});
