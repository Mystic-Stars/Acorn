import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseCounterValue } from '../../src/lib/counters.ts';

test('counter parser does not interpret pending text or empty strings as zero', () => {
  for (const text of [
    '',
    ' ',
    null,
    '统计中…',
    '暂不可用',
    'NaN',
    '-1',
    '1.2',
    'abc12',
    '12,34',
    '9007199254740992',
  ]) {
    assert.equal(parseCounterValue(text), null);
  }
  assert.equal(parseCounterValue('0'), 0);
  assert.equal(parseCounterValue(' 1,234 '), 1234);
  assert.equal(parseCounterValue('42'), 42);
});
