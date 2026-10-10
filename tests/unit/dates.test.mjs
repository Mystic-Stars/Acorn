import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getSiteAgeInDays } from '../../src/lib/dates.ts';

test('site age counts the configured calendar day, independent of host timezone', () => {
  assert.equal(
    getSiteAgeInDays('2024-03-09', new Date('2026-10-10T05:00:00Z'), 'Asia/Shanghai'),
    946,
  );
  const boundary = new Date('2026-10-09T16:00:00Z');
  assert.equal(getSiteAgeInDays('2026-10-09', boundary, 'Asia/Shanghai'), 2);
  assert.equal(getSiteAgeInDays('2026-10-09', boundary, 'UTC'), 1);
  assert.equal(getSiteAgeInDays('2024-02-28', new Date('2024-03-01T00:00:00Z')), 3);
  assert.equal(getSiteAgeInDays('2026-10-11', boundary, 'Asia/Shanghai'), 0);
  for (const date of ['2026-02-29', '2026-13-01', '2026-2-01', 'not-a-date']) {
    assert.throws(() => getSiteAgeInDays(date));
  }
  assert.throws(() => getSiteAgeInDays('2026-01-01', boundary, 'Invalid/Timezone'));
});
