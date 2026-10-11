/**
 * URL parsing for the front panel: what did the customer just paste?
 *
 * Pure. No network, no I/O. Phase 1 grows the provider list and the ugly-URL fixtures.
 */

export type Provider = "youtube" | "vimeo" | "direct" | "unknown";

export type ParsedVideoUrl = {
  provider: Provider;
  /** Provider-native id when we can read one; null for direct files and unknowns. */
  id: string | null;
  /** The cleanest URL we would hand to a fetcher. Tracking junk removed. */
  canonicalUrl: string;
};

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"]);
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const DIRECT_EXT = /\.(mp4|webm|mov|m4v|mkv)$/i;

/** Returns null when the input is not a URL at all. */
export function parseVideoUrl(input: string): ParsedVideoUrl | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  const host = url.hostname.toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return youtube(id);
  }
  if (YOUTUBE_HOSTS.has(host)) {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "watch") {
      return youtube(url.searchParams.get("v") ?? "");
    }
    if ((parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") && parts[1]) {
      return youtube(parts[1]);
    }
    return { provider: "unknown", id: null, canonicalUrl: url.toString() };
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = /\/(?:video\/)?(\d+)/.exec(url.pathname);
    if (m) {
      return { provider: "vimeo", id: m[1], canonicalUrl: `https://vimeo.com/${m[1]}` };
    }
  }
  if (DIRECT_EXT.test(url.pathname)) {
    url.hash = "";
    return { provider: "direct", id: null, canonicalUrl: url.toString() };
  }
  return { provider: "unknown", id: null, canonicalUrl: url.toString() };
}

function youtube(id: string): ParsedVideoUrl {
  if (!YOUTUBE_ID.test(id)) {
    return { provider: "unknown", id: null, canonicalUrl: "" };
  }
  return { provider: "youtube", id, canonicalUrl: `https://www.youtube.com/watch?v=${id}` };
}
