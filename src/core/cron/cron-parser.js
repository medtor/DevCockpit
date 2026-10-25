const FIELD_DEFINITIONS = [
  { name: 'minute', min: 0, max: 59 },
  { name: 'hour', min: 0, max: 23 },
  { name: 'day of month', min: 1, max: 31 },
  { name: 'month', min: 1, max: 12 },
  { name: 'day of week', min: 0, max: 7 },
];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function utcTimestamp(year, month, day, hour = 0, minute = 0, second = 0) {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, 0);
  return date.getTime();
}

function parseField(source, definition) {
  const values = new Set();
  const parts = source.split(',');
  if (parts.some((part) => part === '')) throw new Error(`Invalid ${definition.name}: empty list item.`);
  for (const part of parts) {
    const match = /^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/.exec(part);
    if (!match) throw new Error(`Invalid ${definition.name}: use numbers, lists, ranges, or steps only.`);
    const step = match[2] === undefined ? 1 : Number(match[2]);
    if (!Number.isSafeInteger(step) || step < 1) throw new Error(`Invalid ${definition.name}: step must be a positive safe integer.`);
    let start;
    let end;
    if (match[1] === '*') {
      start = definition.min;
      end = definition.max;
    } else if (match[1].includes('-')) {
      [start, end] = match[1].split('-').map(Number);
    } else {
      start = Number(match[1]);
      end = match[2] === undefined ? start : definition.max;
    }
    if (start < definition.min || start > definition.max || end < definition.min || end > definition.max) {
      throw new Error(`${definition.name} must be between ${definition.min} and ${definition.max}${definition.name === 'day of week' ? ' (7 is also Sunday)' : ''}.`);
    }
    if (start > end) throw new Error(`${definition.name} range must not go backwards.`);
    for (let value = start; value <= end; value += step) values.add(definition.name === 'day of week' && value === 7 ? 0 : value);
  }
  const domainSize = definition.name === 'day of week' ? 7 : definition.max - definition.min + 1;
  return { values, wildcard: values.size === domainSize, source };
}

function fieldText(field, singular, names) {
  const values = [...field.values].sort((a, b) => a - b);
  if (field.wildcard && values.length === (names ? 7 : undefined)) return `every ${singular}`;
  if (values.length === 1) return names ? names[values[0]] : String(values[0]);
  return values.map((value) => names ? names[value] : String(value)).join(', ');
}

function explain(fields) {
  const [minute, hour, day, month, weekday] = fields;
  const minuteStep = /^\*\/(\d+)$/.exec(minute.source);
  const minuteStepValue = minuteStep ? Number(minuteStep[1]) : null;
  const minuteText = minuteStepValue === 1
    ? 'every minute'
    : minuteStepValue !== null && minuteStepValue < 60 && 60 % minuteStepValue === 0
      ? `every ${minuteStepValue} minutes`
      : minute.wildcard
        ? 'every minute'
        : minute.values.size === 1
          ? `at minute ${[...minute.values][0]}`
          : `at minutes ${fieldText(minute, 'minute')}`;
  const hourText = hour.wildcard ? (minute.wildcard ? '' : ' of every hour') : ` past hour${hour.values.size > 1 ? 's' : ''} ${fieldText(hour, 'hour')}`;
  const monthText = month.wildcard ? '' : ` in ${fieldText(month, 'month', MONTHS)}`;
  const dayText = day.wildcard && weekday.wildcard ? ' every day' : day.wildcard ? ` on ${fieldText(weekday, 'weekday', WEEKDAYS)}` : weekday.wildcard ? ` on day ${fieldText(day, 'day')}` : ` on day ${fieldText(day, 'day')} or ${fieldText(weekday, 'weekday', WEEKDAYS)}`;
  return `${minuteText}${hourText}${dayText}${monthText}.`;
}

function timezoneFormatter(timeZone) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone, year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23', weekday: 'short',
    });
  } catch {
    throw new Error(`Invalid IANA timezone: ${String(timeZone)}.`);
  }
}

function getLocalParts(formatter, instant) {
  const parts = Object.fromEntries(formatter.formatToParts(instant).map(({ type, value }) => [type, value]));
  return {
    minute: Number(parts.minute), hour: Number(parts.hour), second: Number(parts.second), day: Number(parts.day),
    month: Number(parts.month), year: Number(parts.year),
    weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday),
  };
}

function calendarMatches(fields, local) {
  const [, , day, month, weekday] = fields;
  if (!month.values.has(local.month)) return false;
  const dayMatches = day.values.has(local.day);
  const weekdayMatches = weekday.values.has(local.weekday);
  return day.wildcard ? weekdayMatches : weekday.wildcard ? dayMatches : dayMatches || weekdayMatches;
}

function getOffsetMilliseconds(formatter, instantMs) {
  const local = getLocalParts(formatter, new Date(instantMs));
  const localAsUtc = utcTimestamp(local.year, local.month, local.day, local.hour, local.minute, local.second);
  return localAsUtc - instantMs;
}

function getOffsetsForLocalDay(formatter, day) {
  const noon = utcTimestamp(day.year, day.month, day.day, 12);
  const margin = 36 * 60 * 60000;
  return new Set([
    getOffsetMilliseconds(formatter, noon - margin),
    getOffsetMilliseconds(formatter, noon),
    getOffsetMilliseconds(formatter, noon + margin),
  ]);
}

function getInstantsForLocalTime(formatter, day, hour, minute, offsets) {
  const wallTime = utcTimestamp(day.year, day.month, day.day, hour, minute);
  const instants = new Set();
  for (const offset of offsets) {
    const instant = wallTime - offset;
    const local = getLocalParts(formatter, new Date(instant));
    if (local.year === day.year && local.month === day.month && local.day === day.day &&
        local.hour === hour && local.minute === minute && local.second === 0) instants.add(instant);
  }
  return instants;
}

function findNextRuns(fields, formatter, now) {
  const nowMs = now.getTime();
  const localNow = getLocalParts(formatter, now);
  const firstDay = utcTimestamp(localNow.year, localNow.month, localNow.day - 1);
  const lastDay = utcTimestamp(localNow.year + CRON_PREVIEW_HORIZON_YEARS, localNow.month, localNow.day);
  const hours = [...fields[1].values].sort((a, b) => a - b);
  const minutes = [...fields[0].values].sort((a, b) => a - b);
  const nextRuns = [];
  const pending = new Set();

  for (let dayMs = firstDay; dayMs <= lastDay; dayMs += 24 * 60 * 60000) {
    const date = new Date(dayMs);
    const day = {
      year: date.getUTCFullYear(), month: date.getUTCMonth() + 1,
      day: date.getUTCDate(), weekday: date.getUTCDay(),
    };
    if (calendarMatches(fields, day)) {
      const offsets = getOffsetsForLocalDay(formatter, day);
      for (const hour of hours) {
        for (const minute of minutes) {
          for (const instant of getInstantsForLocalTime(formatter, day, hour, minute, offsets)) {
            if (instant > nowMs) pending.add(instant);
          }
        }
      }
    }

    // IANA civil offsets stay strictly within 24 hours, so future local dates cannot map before this wall-time boundary.
    const ready = [...pending].filter((instant) => instant < dayMs).sort((a, b) => a - b);
    for (const instant of ready) {
      pending.delete(instant);
      nextRuns.push(new Date(instant).toISOString());
      if (nextRuns.length === 5) return nextRuns;
    }
  }

  for (const instant of [...pending].sort((a, b) => a - b)) {
    nextRuns.push(new Date(instant).toISOString());
    if (nextRuns.length === 5) break;
  }
  return nextRuns;
}

/** Parse a five-field Unix cron expression and preview its next five UTC instants. */
export const CRON_PREVIEW_HORIZON_YEARS = 25;

export function parseCronExpression(expression, options = {}) {
  options = options && typeof options === 'object' ? options : {};
  const errors = [];
  try {
    if (typeof expression !== 'string') throw new Error('Cron expression must be text.');
    const source = expression.trim();
    const tokens = source ? source.split(/\s+/) : [];
    if (tokens.length !== 5) throw new Error('Use exactly five fields: minute hour day-of-month month day-of-week.');
    const fields = tokens.map((token, index) => parseField(token, FIELD_DEFINITIONS[index]));
    const timeZone = options.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formatter = timezoneFormatter(timeZone);
    const now = options.now === undefined ? new Date() : new Date(options.now);
    if (!Number.isFinite(now.getTime())) throw new Error('Reference time is invalid.');
    const nextRuns = findNextRuns(fields, formatter, now);
    const warnings = nextRuns.length < 5
      ? [`Only ${nextRuns.length} occurrences found within ${CRON_PREVIEW_HORIZON_YEARS} years.`]
      : [];
    return { valid: true, expression: source, timeZone, explanation: explain(fields), nextRuns, errors, warnings };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Could not parse this cron expression.');
    return { valid: false, expression: typeof expression === 'string' ? expression : '', timeZone: options.timeZone ?? '', explanation: '', nextRuns: [], errors, warnings: [] };
  }
}
