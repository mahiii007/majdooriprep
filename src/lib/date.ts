import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { addDays, format, parseISO } from "date-fns";

// Re-exported so callers needing to *display* a date in APP_TIMEZONE (e.g.
// the dashboard's "today" label) import from this single module rather than
// reaching for date-fns-tz directly.
export { formatInTimeZone };

// Single source of truth for "what day is it" across the app. Every streak
// and daily-assignment computation calls through here instead of using
// `new Date()` / local server time directly, so behavior doesn't depend on
// which machine or region the Node process happens to run in.
//
// MVP decision: one shared timezone for all users (default UTC), not a
// per-user timezone. See DESIGN.md "Timezone strategy" for the tradeoff.
export const APP_TIMEZONE = process.env.APP_TIMEZONE || "UTC";

/** Today's calendar day as "YYYY-MM-DD" in APP_TIMEZONE. */
export function todayKey(): string {
  return formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy-MM-dd");
}

/** Given a "YYYY-MM-DD" key, return the key for the previous calendar day. */
export function previousDayKey(dateKey: string): string {
  // Parse as a zoned midnight so DST-shifted zones still step exactly one
  // calendar day, not one 24h duration.
  const zoned = toZonedTime(`${dateKey}T00:00:00`, APP_TIMEZONE);
  const prev = addDays(zoned, -1);
  return format(prev, "yyyy-MM-dd");
}

/** Sort/compare helper: true if `a` is the calendar day immediately after `b`. */
export function isNextDay(a: string, b: string): boolean {
  return a === nextDayKey(b);
}

export function nextDayKey(dateKey: string): string {
  const zoned = toZonedTime(`${dateKey}T00:00:00`, APP_TIMEZONE);
  const next = addDays(zoned, 1);
  return format(next, "yyyy-MM-dd");
}

/** Parse a "YYYY-MM-DD" key back into a Date (UTC midnight) for display. */
export function keyToDate(dateKey: string): Date {
  return parseISO(dateKey);
}
