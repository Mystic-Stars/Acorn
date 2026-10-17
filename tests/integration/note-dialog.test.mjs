import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import NoteDialog from '../../src/components/react/notes/NoteDialog.tsx';
import { bindNoteDialog, findNoteTemplate, mountNoteContent } from '../../src/lib/note-dialog.ts';

const labels = {
  codeCopy: {
    enabled: true,
    buttonLabel: 'Copy',
    copiedLabel: 'Copied',
    failedLabel: 'Failed',
    copiedStatus: 'Copied code',
    failedStatus: 'Copy failed',
  },
  imageLabel: 'Original image',
};

test('dialog intercepts ordinary clicks only when its built content exists', () => {
  const dom = new JSDOM(
    '<a data-note-open="one" href="/notes/one/"><span>Details</span></a><a data-note-open="missing" href="/notes/missing/">Missing</a><template data-note-template="one"><p>Content</p></template>',
  );
  const document = dom.window.document;
  const opened = [];
  const dispose = bindNoteDialog(document, (template) => opened.push(template));
  const trigger = document.querySelector('a');
  const click = new dom.window.MouseEvent('click', { bubbles: true, cancelable: true });
  trigger.querySelector('span').dispatchEvent(click);
  assert.equal(click.defaultPrevented, true);
  assert.equal(document.activeElement, trigger);
  assert.equal(opened[0], findNoteTemplate(document, 'one'));
  for (const modifiers of [
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { button: 1 },
  ]) {
    const event = new dom.window.MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ...modifiers,
    });
    trigger.dispatchEvent(event);
    assert.equal(event.defaultPrevented, false);
  }
  const missing = new dom.window.MouseEvent('click', { bubbles: true, cancelable: true });
  document.querySelector('[data-note-open="missing"]').dispatchEvent(missing);
  assert.equal(missing.defaultPrevented, false);
  dispose();
  trigger.click();
  assert.equal(opened.length, 1);
  dom.window.close();
});

test('dialog content keeps templates inert, scopes anchors, and disposes reading helpers', async () => {
  const dom = new JSDOM(
    `<template data-note-template="one">
    <div class="prose">
      <h2 id="section">Section</h2><a href="#section">Jump</a><div aria-labelledby="section">Region</div>
      <img src="/images/photo.png" alt="Photo"><a href="/existing/"><img src="/images/linked.png" alt=""></a>
      <div class="article-code-block"><div class="article-code-toolbar"><button hidden data-code-copy>Copy</button><span data-code-copy-status></span></div><pre><code>  code()</code></pre></div>
    </div>
  </template><div id="container"></div>`,
    { url: 'https://example.com/notes/' },
  );
  const document = dom.window.document;
  const copied = [];
  Object.defineProperty(dom.window.navigator, 'clipboard', {
    value: { writeText: async (value) => copied.push(value) },
  });
  const template = findNoteTemplate(document, 'one');
  const container = document.getElementById('container');
  const dispose = mountNoteContent(container, template, labels);
  assert.equal(document.querySelectorAll('#section').length, 0);
  assert.equal(container.querySelector('h2').id, 'note-dialog-one-section');
  assert.equal(container.querySelector('a').getAttribute('href'), '#note-dialog-one-section');
  assert.equal(
    container.querySelector('[aria-labelledby]').getAttribute('aria-labelledby'),
    'note-dialog-one-section',
  );
  assert.equal(container.querySelector('img').closest('a').target, '_blank');
  assert.equal(
    container.querySelector('a[href="/existing/"] img').parentElement.getAttribute('href'),
    '/existing/',
  );
  const button = container.querySelector('[data-code-copy]');
  assert.equal(button.hidden, false);
  button.click();
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(copied, ['  code()']);
  assert.equal(template.content.querySelector('[data-code-copy]').hidden, true);
  assert.ok(template.content.querySelector('#section'));
  dispose();
  assert.equal(container.childNodes.length, 0);
  dom.window.close();
});

test('the actual Animal Island Modal closes with Esc and restores focus and scrolling', async () => {
  const dom = new JSDOM(
    '<a data-note-open="one" href="/notes/one/">Details</a><template data-note-template="one" data-note-title="Note title" data-note-href="/notes/one/"><div class="prose note-body"><p>Full note</p><a href="/other/">Related</a></div></template><div id="app"></div>',
    { url: 'https://example.com/notes/', pretendToBeVisual: true },
  );
  const bindings = {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    Element: dom.window.Element,
    Node: dom.window.Node,
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  const previous = new Map(
    Object.keys(bindings).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  for (const [key, value] of Object.entries(bindings))
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  const document = dom.window.document;
  const root = createRoot(document.getElementById('app'));
  try {
    const config = {
      closeLabel: 'Close details',
      copyLabel: 'Copy link',
      copiedLabel: 'Copied',
      copyFailedLabel: 'Failed',
      imageLabel: 'Original image',
    };
    await act(async () => {
      root.render(createElement(NoteDialog, { config, codeCopy: labels.codeCopy }));
    });
    const trigger = document.querySelector('a[data-note-open]');
    assert.equal(trigger.dataset.noteDialogReady, 'true');
    await act(async () => {
      trigger.click();
    });
    await act(async () => {
      await new Promise((resolve) => dom.window.setTimeout(resolve, 0));
    });
    const dialog = document.querySelector('[role="dialog"]');
    assert.ok(dialog);
    assert.equal(dialog.getAttribute('aria-modal'), 'true');
    assert.equal(dialog.querySelector('.note-body').textContent, 'Full noteRelated');
    assert.equal(document.body.style.overflow, 'hidden');
    const first = dialog.querySelector('button');
    const last = dialog.querySelector('a[href="/other/"]');
    last.focus();
    document.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    );
    assert.equal(document.activeElement, first);
    await act(async () => {
      document.dispatchEvent(
        new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    });
    assert.equal(document.querySelector('[role="dialog"]'), null);
    assert.equal(document.body.style.overflow, '');
    assert.equal(document.activeElement, trigger);
    await act(async () => {
      trigger.click();
    });
    await act(async () => {
      document.querySelector('button[aria-label="Close details"]').click();
    });
    assert.equal(document.querySelector('[role="dialog"]'), null);
  } finally {
    await act(async () => {
      root.unmount();
    });
    dom.window.close();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
