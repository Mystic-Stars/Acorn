import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { bindCopyLinks } from '../../src/lib/copy-link.ts';

async function runCopy(writeText, verify) {
  const dom = new JSDOM(
    '<div data-copy-container><button hidden data-copy-link="https://example.com/rss.xml" data-copy-success="Copied" data-copy-error="Failed">Copy</button><span data-copy-status></span><a hidden data-copy-fallback></a></div>',
  );
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { clipboard: { writeText } },
  });
  try {
    bindCopyLinks(dom.window.document);
    bindCopyLinks(dom.window.document);
    const button = dom.window.document.querySelector('button');
    assert.equal(button.hidden, false);
    button.click();
    await new Promise((resolve) => setImmediate(resolve));
    await verify(dom.window.document, button);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'navigator', previous);
    else delete globalThis.navigator;
    dom.window.close();
  }
}

test('copy uses the configured absolute URL and binds only once', async () => {
  const copied = [];
  await runCopy(
    async (url) => copied.push(url),
    (document, button) => {
      assert.deepEqual(copied, ['https://example.com/rss.xml']);
      assert.equal(document.querySelector('[data-copy-status]').textContent, 'Copied');
      assert.equal(document.querySelector('[data-copy-fallback]').hidden, true);
      assert.equal(button.disabled, false);
    },
  );
});

test('clipboard failure exposes a manual fallback and permits retry', async () => {
  await runCopy(
    async () => {
      throw new Error('Denied');
    },
    (document, button) => {
      assert.equal(document.querySelector('[data-copy-status]').textContent, 'Failed');
      assert.equal(document.querySelector('[data-copy-fallback]').hidden, false);
      assert.equal(button.disabled, false);
    },
  );
});
