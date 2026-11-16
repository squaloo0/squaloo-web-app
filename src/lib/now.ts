/**
 * /now's pure rules (SQU-436). No I/O: tested by `npm run now:test`. Dates are
 * ISO strings (YYYY-MM-DD) and are never turned into a local-time Date, so no
 * timezone can move a day.
 */

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** A real calendar date written YYYY-MM-DD ("2026-02-30" is not one). */
export function isIsoDate(s: unknown): s is string {
  if (typeof s !== "string") return false;
  const m = ISO.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1) return false;
  return d <= new Date(Date.UTC(y, mo, 0)).getUTCDate();
}

/** "2026-11-14" -> "Nov 14, 2026". Throws on anything that is not an ISO date. */
export function formatNowDate(iso: string): string {
  if (!isIsoDate(iso)) throw new Error(`not an ISO date: ${iso}`);
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** Newest first by ISO date. Stable for equal dates; returns a new array. */
export function sortNewestFirst<T extends { date: string }>(entries: readonly T[]): T[] {
  return entries
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (a.e.date < b.e.date ? 1 : a.e.date > b.e.date ? -1 : a.i - b.i))
    .map((x) => x.e);
}
