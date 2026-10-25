import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCronExpression } from '../src/core/cron/cron-parser.js';

test('parses wildcard, list, range and step fields and explains the schedule', () => {
  const result = parseCronExpression('*/15 9-10 1,15 * 1-5', {
    timeZone: 'UTC', now: new Date('2024-01-01T00:00:00Z'),
  });
  assert.equal(result.valid, true);
  assert.match(result.explanation, /15 minutes/);
  assert.equal(result.nextRuns.length, 5);
});

test('rejects malformed fields, out-of-range values and invalid timezones without throwing', () => {
  for (const expression of ['* * * *', '60 * * * *', '1-70 * * * *', '*/0 * * * *', '1,,2 * * * *', '0 0 * * MON']) {
    assert.doesNotThrow(() => parseCronExpression(expression));
    assert.equal(parseCronExpression(expression).valid, false, expression);
  }
  const invalidZone = parseCronExpression('0 0 * * *', { timeZone: 'Mars/Olympus' });
  assert.equal(invalidZone.valid, false);
  assert.match(invalidZone.errors.join(' '), /timezone|time zone/i);
});

test('single-value steps advance to the field maximum', () => {
  const result = parseCronExpression('0 0 1/2 * *', {
    timeZone: 'UTC', now: new Date('2024-01-01T00:00:00Z'),
  });
  assert.equal(result.valid, true);
  assert.equal(result.nextRuns[0], '2024-01-03T00:00:00.000Z');
});

test('returns five occurrences for a valid leap-day schedule beyond the first five years', () => {
  const result = parseCronExpression('0 0 29 2 *', {
    timeZone: 'UTC', now: new Date('2024-03-01T00:00:00Z'),
  });
  assert.deepEqual(result.nextRuns, [
    '2028-02-29T00:00:00.000Z', '2032-02-29T00:00:00.000Z',
    '2036-02-29T00:00:00.000Z', '2040-02-29T00:00:00.000Z',
    '2044-02-29T00:00:00.000Z',
  ]);
});

test('describes minute steps that do not divide the hour as minute values within each hour', () => {
  const cases = [
    ['*/40 * * * *', 'at minutes 0, 40 of every hour every day.'],
    ['*/60 * * * *', 'at minute 0 of every hour every day.'],
    ['*/90 * * * *', 'at minute 0 of every hour every day.'],
  ];
  for (const [expression, explanation] of cases) {
    const result = parseCronExpression(expression, {
      timeZone: 'UTC', now: new Date('2024-01-01T00:00:00Z'),
    });
    assert.equal(result.explanation, explanation, expression);
  }
});

test('converts UTC dates for reference years from 0 through 99 without the 1900 offset', () => {
  const result = parseCronExpression('0 0 * * *', {
    timeZone: 'UTC', now: new Date('0090-01-01T00:00:00Z'),
  });
  assert.equal(result.nextRuns[0], '0090-01-02T00:00:00.000Z');
});

test('treats a full-range DOM field as unrestricted for DOM/DOW semantics', () => {
  const result = parseCronExpression('0 0 */1 * 1', {
    timeZone: 'UTC', now: new Date('2024-01-01T00:01:00Z'),
  });
  assert.equal(result.nextRuns[0], '2024-01-08T00:00:00.000Z');
});

test('explains minute schedules that run during every hour', () => {
  const result = parseCronExpression('0 * * * *', {
    timeZone: 'UTC', now: new Date('2024-01-01T00:00:00Z'),
  });
  assert.match(result.explanation, /every hour/i);
});

test('keeps a syntactically valid but impossible calendar distinct from invalid syntax', () => {
  const result = parseCronExpression('0 0 31 2 *', {
    timeZone: 'UTC', now: new Date('2026-01-01T00:00:00Z'),
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.nextRuns, []);
  assert.match(result.warnings.join(' '), /25 years/i);
});

test('finds five leap-day runs across a non-leap century gap', () => {
  const result = parseCronExpression('0 0 29 2 *', {
    timeZone: 'UTC', now: new Date('2096-03-01T00:00:00Z'),
  });
  assert.deepEqual(result.nextRuns, [
    '2104-02-29T00:00:00.000Z', '2108-02-29T00:00:00.000Z',
    '2112-02-29T00:00:00.000Z', '2116-02-29T00:00:00.000Z',
    '2120-02-29T00:00:00.000Z',
  ]);
});

test('keeps next runs chronological across a historical whole-date timezone rollback', () => {
  const result = parseCronExpression('0 16 * * *', {
    timeZone: 'America/Anchorage', now: new Date('1867-10-19T00:00:00Z'),
  });
  const timestamps = result.nextRuns.map((run) => Date.parse(run));
  assert.equal(timestamps.length, 5);
  assert.equal(new Set(timestamps).size, timestamps.length);
  assert.deepEqual(timestamps, [...timestamps].sort((a, b) => a - b));
  assert.deepEqual(result.nextRuns.slice(0, 2), [
    '1867-10-19T01:59:36.000Z', '1867-10-20T01:59:36.000Z',
  ]);
});

test('uses standard DOM/DOW OR semantics only when both are restricted', () => {
  const both = parseCronExpression('0 0 1 * 1', { timeZone: 'UTC', now: new Date('2024-01-01T00:01:00Z') });
  assert.equal(both.nextRuns[0], '2024-01-08T00:00:00.000Z');
  const dom = parseCronExpression('0 0 1 * *', { timeZone: 'UTC', now: new Date('2024-01-02T00:00:00Z') });
  assert.equal(dom.nextRuns[0], '2024-02-01T00:00:00.000Z');
  const sunday = parseCronExpression('0 0 * * 7', { timeZone: 'UTC', now: new Date('2024-01-01T00:00:00Z') });
  assert.equal(sunday.nextRuns[0], '2024-01-07T00:00:00.000Z');
});

test('returns the five next UTC instants from an injected clock', () => {
  const result = parseCronExpression('30 14 * * *', {
    timeZone: 'UTC', now: new Date('2024-04-01T14:30:00Z'),
  });
  assert.deepEqual(result.nextRuns, [
    '2024-04-02T14:30:00.000Z', '2024-04-03T14:30:00.000Z',
    '2024-04-04T14:30:00.000Z', '2024-04-05T14:30:00.000Z',
    '2024-04-06T14:30:00.000Z',
  ]);
});

test('models both repeated fall-back times and skips nonexistent spring-forward times', () => {
  const repeated = parseCronExpression('30 1 * * *', {
    timeZone: 'America/New_York', now: new Date('2024-11-03T04:00:00Z'),
  });
  assert.deepEqual(repeated.nextRuns.slice(0, 2), [
    '2024-11-03T05:30:00.000Z', '2024-11-03T06:30:00.000Z',
  ]);
  const skipped = parseCronExpression('30 2 * * *', {
    timeZone: 'America/New_York', now: new Date('2024-03-10T00:00:00Z'),
  });
  assert.equal(skipped.nextRuns[0], '2024-03-11T06:30:00.000Z');
});
