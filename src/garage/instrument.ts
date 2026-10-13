/**
 * The instrument's I/O half: one insert per countable request, from the edge, never
 * awaited by the page. Edge-safe: nothing from node: here, and the Neon HTTP driver only.
 */
import { neon } from "@neondatabase/serverless";
import { hitOf, isCountable, type Hit } from "./core/hits.ts";

/** Production only: a dev server on a laptop writes to the same table, and did, once. */
export function instrumentWired(): boolean {
  return process.env.NODE_ENV === "production" && typeof process.env.NEON_DATABASE_URL === "string" && process.env.NEON_DATABASE_URL.length > 0;
}

/** The hit for a request, or null when it is not one we count. */
/** The cookies whose mere presence marks the founder's own browser. Names only; the values are never read. */
export const KEY_COOKIES: readonly string[] = ["garage_key", "remora_key"];

export function hitFor(req: { nextUrl: { pathname: string }; method: string; headers: { get(name: string): string | null }; cookies: { has(name: string): boolean } }): Hit | null {
  const pathname = req.nextUrl.pathname;
  if (!isCountable(pathname)) return null;
  return hitOf({ pathname, method: req.method, userAgent: req.headers.get("user-agent"), referrer: req.headers.get("referer"), keyed: KEY_COOKIES.some((c) => req.cookies.has(c)) });
}

export async function recordHit(h: Hit): Promise<void> {
  const url = process.env.NEON_DATABASE_URL;
  if (!url) return;
  try {
    const sql = neon(url);
    await sql`INSERT INTO garage_hits (path, method, kind, family, ref_host) VALUES (${h.path}, ${h.method}, ${h.kind}, ${h.family}, ${h.refHost})`;
  } catch {
    // The instrument never fails a page. A lost hit is a lost hit; the dashboard says how many days are dark.
  }
}
