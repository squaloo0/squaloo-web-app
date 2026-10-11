/**
 * The window in the glass: which providers answer an oEmbed call, how to ask, and how
 * to read the answer. Pure. The fetch itself lives in ../peek.ts.
 *
 * oEmbed needs no key and no yt-dlp, so it is what the live site uses to show a title,
 * an author and a thumbnail before anyone spends a coin.
 */
import type { ParsedVideoUrl, Provider } from "./url.ts";

export type Peek = {
  provider: Provider;
  id: string | null;
  canonicalUrl: string;
  title: string;
  author: string | null;
  /** The provider's thumbnail URL, untouched. Serve it through thumbProxyPath(). */
  thumbnail: string | null;
};

/** Providers with a public oEmbed endpoint. The rest are yt-dlp-only until Phase 2. */
export function oembedEndpoint(p: ParsedVideoUrl): string | null {
  if (!p.canonicalUrl) {
    return null;
  }
  const u = encodeURIComponent(p.canonicalUrl);
  switch (p.provider) {
    case "youtube":
      return `https://www.youtube.com/oembed?url=${u}&format=json`;
    case "vimeo":
      return `https://vimeo.com/api/oembed.json?url=${u}`;
    default:
      return null;
  }
}

/** Narrow an oEmbed response. Null when it is not a video answer we can show. */
export function parseOembed(json: unknown): Pick<Peek, "title" | "author" | "thumbnail"> | null {
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    return null;
  }
  const o = json as Record<string, unknown>;
  const title = typeof o.title === "string" && o.title.length > 0 ? o.title : null;
  if (title === null) {
    return null;
  }
  return {
    title,
    author: typeof o.author_name === "string" && o.author_name.length > 0 ? o.author_name : null,
    thumbnail: typeof o.thumbnail_url === "string" && isThumbUrl(o.thumbnail_url) ? o.thumbnail_url : null,
  };
}

/**
 * Hosts the thumbnail proxy will fetch from. An allowlist, because the proxy is a
 * server-side fetch of a URL the customer influenced.
 */
export const THUMB_HOSTS: ReadonlySet<string> = new Set(["i.ytimg.com", "img.youtube.com", "i.vimeocdn.com"]);

export function isThumbUrl(input: string): boolean {
  try {
    const u = new URL(input);
    return u.protocol === "https:" && THUMB_HOSTS.has(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}

/** Same-origin path the browser loads instead of the provider's CDN. */
export function thumbProxyPath(thumbnail: string | null): string | null {
  return thumbnail !== null && isThumbUrl(thumbnail) ? `/api/remora/thumb?u=${encodeURIComponent(thumbnail)}` : null;
}
