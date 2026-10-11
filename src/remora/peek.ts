/**
 * Look through the glass: parse a pasted URL, ask the provider's oEmbed endpoint, and
 * hand back a Peek. Server-side only. The browser never talks to the provider.
 *
 * I/O edge: one outbound fetch. Parsing lives in core/url.ts and core/oembed.ts.
 */
import { parseVideoUrl } from "./core/url.ts";
import { oembedEndpoint, parseOembed, type Peek } from "./core/oembed.ts";

export type PeekFailure = {
  ok: false;
  /** 400 not a URL · 404 nothing to show · 502 provider misbehaved · 504 provider slow */
  status: 400 | 404 | 502 | 504;
  /** Machine language, safe to print on the panel. */
  error: string;
};

export type PeekResult = { ok: true; peek: Peek } | PeekFailure;

const TIMEOUT_MS = 8_000;
const USER_AGENT = "Remora/0.1 (+https://squaloo.com/remora)";

export async function peek(input: string): Promise<PeekResult> {
  const parsed = parseVideoUrl(input);
  if (!parsed) {
    return { ok: false, status: 400, error: "that is not a URL" };
  }
  const endpoint = oembedEndpoint(parsed);
  if (!endpoint) {
    const who = parsed.provider === "unknown" ? "that one" : parsed.provider;
    return { ok: false, status: 404, error: `no window for ${who} yet` };
  }

  let res: Response;
  try {
    res = await fetch(endpoint, {
      headers: { accept: "application/json", "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      // A title and a thumbnail do not change by the minute. One fetch an hour per URL.
      next: { revalidate: 3600 },
    });
  } catch (e) {
    const timedOut = e instanceof Error && e.name === "TimeoutError";
    return timedOut
      ? { ok: false, status: 504, error: `${parsed.provider} did not answer in time` }
      : { ok: false, status: 502, error: `${parsed.provider} could not be reached` };
  }

  if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 404) {
    // YouTube says 400 for an id that does not exist; Vimeo says 404 or 403 for private.
    return { ok: false, status: 404, error: `nothing behind the glass at ${parsed.provider} (${res.status})` };
  }
  if (!res.ok) {
    return { ok: false, status: 502, error: `${parsed.provider} answered ${res.status}` };
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return { ok: false, status: 502, error: `${parsed.provider} did not answer in JSON` };
  }
  const narrowed = parseOembed(body);
  if (!narrowed) {
    return { ok: false, status: 502, error: `${parsed.provider} answered without a title` };
  }

  return {
    ok: true,
    peek: { provider: parsed.provider, id: parsed.id, canonicalUrl: parsed.canonicalUrl, ...narrowed },
  };
}
