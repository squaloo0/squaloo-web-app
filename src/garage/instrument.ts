/**
 * The instrument's I/O half: one insert per countable request, from the edge, never
 * awaited by the page. Edge-safe: nothing from node: here, and the Neon HTTP driver only.
 */
import { neon } from "@neondatabase/serverless";
import { hitOf, isCountable, type Hit } from "./core/hits.ts";

export function instrumentWired(): boolean {
  return typeof process.env.NEON_DATABASE_URL === "string" && process.env.NEON_DATABASE_URL.length > 0;
}

/** The hit for a request, or null when it is not one we count. */
export function hitFor(req: { nextUrl: { pathname: string }; method: string; headers: { get(name: string): string | null } }): Hit | null {
  const pathname = req.nextUrl.pathname;
  if (!isCountable(pathname)) return null;
  return hitOf({ pathname, method: req.method, userAgent: req.headers.get("user-agent"), referrer: req.headers.get("referer") });
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
