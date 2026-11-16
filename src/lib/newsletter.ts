/**
 * The newsletter's pure rules (SQU-436), shared by /marshal-qr and /now. No
 * I/O here, so every guard is tested without a database or a server:
 * `npm run newsletter:test`. Relative imports with .ts extensions on purpose:
 * the tests run under node's type stripping, which cannot resolve `@/`.
 */

export type SignupInput = {
  email: unknown;
  name: unknown;
  consent: unknown;
  /** The honeypot. A person never sees it; a form-filling script fills it. */
  website: unknown;
  src: unknown;
};

export type SignupCheck<S extends string = string> =
  | { ok: true; email: string; name: string | null; src: S }
  | { ok: false; reason: "honeypot" | "email" | "consent" | "name" };

// Deliberately plain: one @, a dot in the domain, no spaces. The real test is
// the confirmation that a person reads the newsletter at all.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The signup rules with the page's source normalizer injected. */
export function checkSignupWith<S extends string>(
  input: SignupInput,
  normalizeSrc: (raw: string | undefined) => S,
): SignupCheck<S> {
  if (typeof input.website === "string" && input.website.trim() !== "") return { ok: false, reason: "honeypot" };
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (email.length < 3 || email.length > 254 || !EMAIL.test(email)) return { ok: false, reason: "email" };
  if (input.consent !== "on" && input.consent !== true) return { ok: false, reason: "consent" };
  const rawName = typeof input.name === "string" ? input.name.trim() : "";
  if (rawName.length > 120) return { ok: false, reason: "name" };
  const src = normalizeSrc(typeof input.src === "string" ? input.src : undefined);
  return { ok: true, email, name: rawName === "" ? null : rawName, src };
}

/**
 * A fixed-window limiter keyed by caller. In memory, so on Vercel it is
 * per-instance and best-effort: it slows a script hammering one instance, it
 * is not a wall. Said so in the PR.
 */
export function makeRateLimiter(limit: number, windowMs: number) {
  const seen = new Map<string, { start: number; count: number }>();
  return function allow(key: string, now: number = Date.now()): boolean {
    const k = key || "unknown";
    const w = seen.get(k);
    if (!w || now - w.start >= windowMs) {
      seen.set(k, { start: now, count: 1 });
      if (seen.size > 5000) {
        for (const [kk, ww] of seen) if (now - ww.start >= windowMs) seen.delete(kk);
      }
      return true;
    }
    if (w.count >= limit) return false;
    w.count += 1;
    return true;
  };
}

/**
 * The /now source rule. The cap is the `subscribers.source` column width
 * (`VARCHAR(16)`, migration 0002); widening it needs a migration first.
 */
export const NOW_SOURCE_MAX = 16;
export const NOW_SOURCE_DEFAULT = "direct";

const NOW_SOURCE = new RegExp(`^[a-z0-9-]{1,${NOW_SOURCE_MAX}}$`);

/** `?src=` as Next hands it over (string, string[], or absent) -> a short slug, else "direct". */
export function normalizeNowSource(raw: string | string[] | undefined | null): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (typeof v !== "string") return NOW_SOURCE_DEFAULT;
  const s = v.trim().toLowerCase();
  return NOW_SOURCE.test(s) ? s : NOW_SOURCE_DEFAULT;
}

/** The n in a `source VARCHAR(n)` line of a migration, or null if there is none. */
export function sourceColumnWidth(sql: string): number | null {
  const m = /\bsource\s+varchar\s*\(\s*(\d+)\s*\)/i.exec(sql);
  return m ? Number(m[1]) : null;
}

/**
 * /marshal-qr's allowlist rule: where a visitor came from. Anything else reads
 * as the board. (Lives here so the shared newsletter components do not depend
 * on a route folder; /marshal-qr's meridian.ts re-exports it.)
 */
export const SOURCES = ["board", "stage", "flyer", "card", "linkedin"] as const;
export type Source = (typeof SOURCES)[number];

const SOURCE_SET: ReadonlySet<string> = new Set(SOURCES);

/** `?src=` as Next hands it over (string, string[], or absent) -> a known source. */
export function normalizeSource(raw: string | string[] | undefined | null): Source {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (typeof v !== "string") return "board";
  const s = v.trim().toLowerCase();
  return SOURCE_SET.has(s) ? (s as Source) : "board";
}
