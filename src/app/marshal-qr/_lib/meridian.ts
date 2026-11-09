/**
 * The Meridian landing page's pure rules (SQU-427). No I/O here, so every
 * guard is tested without a database or a server: `npm run meridian:test`.
 *
 * Counting: this page adds no tracker. The site's existing server-side
 * instrument (src/middleware.ts -> garage_hits) records one row per request
 * with the normalised PATH and never the query string. So a scan source the
 * counts can tell apart has to be a path: the flyer prints /qr, the deck's
 * slide /qr/stage, the ask card /qr/card. Those routes redirect here with
 * ?src=, which only the newsletter row keeps.
 */

/** Where a visitor came from. Anything else reads as the board. */
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

/**
 * The redirect for /qr and /qr/<segment>. Only an allowlisted source is ever
 * written into the Location, so nothing a visitor types can steer the
 * redirect off this site or into the query string.
 */
export function qrRedirectPath(segment: string | undefined | null, fallback: Source = "flyer"): string {
  const src = segment == null || segment === "" ? fallback : normalizeSource(segment);
  return src === "board" ? "/marshal-qr" : `/marshal-qr?src=${src}`;
}

/** The four asks' mail actions. Subjects as the brief sets them. */
export function mailto(subject: string, to = "marshal@squaloo.com"): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}`;
}

export type SignupInput = {
  email: unknown;
  name: unknown;
  consent: unknown;
  /** The honeypot. A person never sees it; a form-filling script fills it. */
  website: unknown;
  src: unknown;
};

export type SignupCheck =
  | { ok: true; email: string; name: string | null; src: Source }
  | { ok: false; reason: "honeypot" | "email" | "consent" | "name" };

// Deliberately plain: one @, a dot in the domain, no spaces. The real test is
// the confirmation that a person reads the newsletter at all.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function checkSignup(input: SignupInput): SignupCheck {
  if (typeof input.website === "string" && input.website.trim() !== "") return { ok: false, reason: "honeypot" };
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (email.length < 3 || email.length > 254 || !EMAIL.test(email)) return { ok: false, reason: "email" };
  if (input.consent !== "on" && input.consent !== true) return { ok: false, reason: "consent" };
  const rawName = typeof input.name === "string" ? input.name.trim() : "";
  if (rawName.length > 120) return { ok: false, reason: "name" };
  const src = normalizeSource(typeof input.src === "string" ? input.src : undefined);
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

/** A file size the way a person reads it: "438 KB", "1.2 MB". */
export function humanSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1000 * 1000) return `${Math.max(1, Math.round(bytes / 1000))} KB`;
  return `${(bytes / (1000 * 1000)).toFixed(1)} MB`;
}
