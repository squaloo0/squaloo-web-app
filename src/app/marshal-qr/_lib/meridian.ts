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

import { checkSignupWith, normalizeSource, type Source, type SignupCheck as SharedSignupCheck, type SignupInput } from "../../../lib/newsletter.ts";

/**
 * The redirect for /qr and /qr/<segment>. Only an allowlisted source is ever
 * written into the Location, so nothing a visitor types can steer the
 * redirect off this site or into the query string.
 */
export function qrRedirectPath(segment: string | undefined | null, fallback: Source = "flyer"): string {
  const src = segment == null || segment === "" ? fallback : normalizeSource(segment);
  return src === "board" ? "/marshal-qr" : `/marshal-qr?src=${src}`;
}

export { mailto } from "../../../lib/mail.ts";
export { makeRateLimiter, type SignupInput } from "../../../lib/newsletter.ts";
export { SOURCES, normalizeSource, type Source } from "../../../lib/newsletter.ts";

export type SignupCheck = SharedSignupCheck<Source>;

export function checkSignup(input: SignupInput): SignupCheck {
  return checkSignupWith(input, normalizeSource);
}

export { humanSize } from "../../../lib/size.ts";
