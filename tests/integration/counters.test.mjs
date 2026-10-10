import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { observeCounter } from '../../src/lib/counters.ts';

test('delayed counters update legacy totals once real data arrives', async () => {
  const dom = new JSDOM('<span id="counter">统计中…</span><strong>100</strong>');
  try {
    const source = dom.window.document.querySelector('span');
    const output = dom.window.document.querySelector('strong');
    let calls = 0;
    const ready = new Promise((resolve, reject) => {
      observeCounter(
        source,
        (value) => {
          calls += 1;
          output.textContent = String(100 + value);
          resolve();
        },
        () => reject(new Error('Counter timed out')),
        1000,
      );
    });
    assert.equal(output.textContent, '100');
    source.textContent = '25';
    await ready;
    assert.equal(output.textContent, '125');
    source.textContent = '26';
    await Promise.resolve();
    assert.equal(calls, 1);
  } finally {
    dom.window.close();
  }
});

test('already populated zero counters are accepted immediately', () => {
  const dom = new JSDOM('<span>0</span>');
  try {
    let result;
    observeCounter(
      dom.window.document.querySelector('span'),
      (value) => {
        result = value;
      },
      () => assert.fail('Unexpected timeout'),
      1000,
    );
    assert.equal(result, 0);
  } finally {
    dom.window.close();
  }
});

test('failed counters time out without replacing historical values', async () => {
  const dom = new JSDOM('<span>统计中…</span><strong>100</strong>');
  try {
    const source = dom.window.document.querySelector('span');
    const output = dom.window.document.querySelector('strong');
    await new Promise((resolve) => {
      observeCounter(source, () => assert.fail('Pending text is not a number'), resolve, 5);
    });
    assert.equal(output.textContent, '100');
    source.textContent = '25';
    await Promise.resolve();
    assert.equal(output.textContent, '100');
  } finally {
    dom.window.close();
  }
});

test('counter subscriptions can be disposed before a result arrives', async () => {
  const dom = new JSDOM('<span>统计中…</span>');
  try {
    let calls = 0;
    const source = dom.window.document.querySelector('span');
    const dispose = observeCounter(
      source,
      () => {
        calls += 1;
      },
      () => {
        calls += 1;
      },
      5,
    );
    dispose();
    source.textContent = '12';
    await new Promise((resolve) => setTimeout(resolve, 15));
    assert.equal(calls, 0);
  } finally {
    dom.window.close();
  }
});

test('pending counter subscriptions survive a back-forward cache page hide', async () => {
  const dom = new JSDOM('<span>统计中…</span>');
  try {
    const source = dom.window.document.querySelector('span');
    const ready = new Promise((resolve, reject) => {
      observeCounter(source, resolve, () => reject(new Error('Counter timed out')), 1000);
    });
    dom.window.dispatchEvent(new dom.window.PageTransitionEvent('pagehide', { persisted: true }));
    dom.window.dispatchEvent(new dom.window.PageTransitionEvent('pageshow', { persisted: true }));
    source.textContent = '42';
    assert.equal(await ready, 42);
  } finally {
    dom.window.close();
  }
});
