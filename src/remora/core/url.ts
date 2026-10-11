/**
 * URL parsing for the front panel: what did the customer just paste?
 *
 * Pure. No network, no I/O. The fixture list in `url.fixtures.ts` is the spec: every
 * ugly URL anyone has pasted into the glass, and what the machine should read off it.
 *
 * A `provider` is a host the machine recognises. An `id` is the provider-native handle
 * when the URL carries one; null for direct files, short links that need a redirect to
 * resolve, and anything we do not understand. `canonicalUrl` is the cleanest URL we
 * would hand to a fetcher: tracking junk gone, one spelling per video.
 */

export type Provider =
  | "youtube"
  | "vimeo"
  | "tiktok"
  | "x"
  | "reddit"
  | "twitch"
  | "instagram"
  | "direct"
  | "unknown";

export type ParsedVideoUrl = {
  provider: Provider;
  /** Provider-native id when we can read one; null for direct files and unknowns. */
  id: string | null;
  /** The cleanest URL we would hand to a fetcher. Tracking junk removed. */
  canonicalUrl: string;
};

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
]);
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const X_HOSTS = new Set(["x.com", "www.x.com", "mobile.x.com", "twitter.com", "www.twitter.com", "mobile.twitter.com"]);
const REDDIT_HOSTS = new Set(["reddit.com", "www.reddit.com", "old.reddit.com", "new.reddit.com", "m.reddit.com"]);
const TWITCH_HOSTS = new Set(["twitch.tv", "www.twitch.tv", "m.twitch.tv"]);
const INSTAGRAM_HOSTS = new Set(["instagram.com", "www.instagram.com", "m.instagram.com"]);
const INSTAGRAM_KINDS = new Set(["p", "reel", "reels", "tv"]);
const DIRECT_EXT = /\.(mp4|webm|mov|m4v|mkv)$/i;

/**
 * Query keys that never identify a video, only who shared it and from where. Dropped from
 * every URL before we look at it. `utm_*` is matched by prefix below.
 */
const JUNK_PARAMS = new Set([
  "si", // YouTube share id
  "feature",
  "list", // playlist context; we vend one video
  "index",
  "pp",
  "app",
  "t", // start offset
  "start",
  "s", // X share source
  "ref",
  "ref_src",
  "ref_url",
  "fbclid",
  "gclid",
  "igsh",
  "igshid",
  "is_copy_url",
  "is_from_webapp",
  "sender_device",
  "sender_web_id",
  "web_id",
  "share_context",
  "_r",
  "_t",
]);

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

  url.hash = "";
  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);

  // --- A file on a server somewhere ------------------------------------------------
  if (DIRECT_EXT.test(url.pathname)) {
    // The query stays untouched: signed URLs carry their signature there.
    return { provider: "direct", id: null, canonicalUrl: url.toString() };
  }

  stripJunk(url);

  // --- YouTube -------------------------------------------------------------------
  if (host === "youtu.be") {
    return youtube(parts[0] ?? "");
  }
  if (YOUTUBE_HOSTS.has(host)) {
    if (parts[0] === "watch") {
      // /watch?v=ID is the common form; /watch/ID exists in the wild too.
      return youtube(url.searchParams.get("v") ?? parts[1] ?? "");
    }
    if (["shorts", "embed", "live", "v", "e"].includes(parts[0] ?? "") && parts[1]) {
      return youtube(parts[1]);
    }
    return unknown(url);
  }

  // --- Vimeo ---------------------------------------------------------------------
  if (host === "vimeo.com" || host === "www.vimeo.com" || host === "player.vimeo.com") {
    // /ID, /video/ID, /channels/x/ID, /groups/x/videos/ID; an unlisted hash may follow
    // as /ID/HASH or as ?h=HASH, and the fetcher needs it, so it stays in the canonical URL.
    const m = /\/(\d+)(?:\/([0-9a-f]+))?\/?$/.exec(url.pathname);
    if (m) {
      const unlisted = m[2] ?? url.searchParams.get("h");
      const canonicalUrl = unlisted ? `https://vimeo.com/${m[1]}/${unlisted}` : `https://vimeo.com/${m[1]}`;
      return { provider: "vimeo", id: m[1], canonicalUrl };
    }
    return unknown(url);
  }

  // --- TikTok --------------------------------------------------------------------
  if (host === "tiktok.com" || host === "www.tiktok.com" || host === "m.tiktok.com") {
    // /@user/video/ID, /@user/photo/ID; /t/SHORT is a redirect we cannot resolve offline.
    const i = parts.findIndex((p) => p === "video" || p === "photo");
    if (i > 0 && parts[0]?.startsWith("@") && /^\d+$/.test(parts[i + 1] ?? "")) {
      return {
        provider: "tiktok",
        id: parts[i + 1],
        canonicalUrl: `https://www.tiktok.com/${parts[0]}/${parts[i]}/${parts[i + 1]}`,
      };
    }
    if (/^\d+$/.test(parts[1] ?? "") && parts[0] === "embed") {
      return { provider: "tiktok", id: parts[1], canonicalUrl: `https://www.tiktok.com/embed/${parts[1]}` };
    }
    if (parts[0] === "t" && parts[1]) {
      return { provider: "tiktok", id: null, canonicalUrl: `https://www.tiktok.com/t/${parts[1]}` };
    }
    return unknown(url);
  }
  if (host === "vm.tiktok.com" || host === "vt.tiktok.com") {
    // Short links: a real TikTok, but the id is behind a redirect.
    return parts[0]
      ? { provider: "tiktok", id: null, canonicalUrl: `https://${host}/${parts[0]}` }
      : unknown(url);
  }

  // --- X / Twitter ---------------------------------------------------------------
  if (X_HOSTS.has(host)) {
    // /user/status/ID, /i/status/ID, /i/web/status/ID
    const i = parts.indexOf("status");
    const id = parts[i + 1];
    if (i >= 0 && /^\d+$/.test(id ?? "")) {
      const user = i === 1 && parts[0] !== "i" ? parts[0] : "i";
      return { provider: "x", id, canonicalUrl: `https://x.com/${user}/status/${id}` };
    }
    return unknown(url);
  }

  // --- Reddit --------------------------------------------------------------------
  if (REDDIT_HOSTS.has(host)) {
    // /r/sub/comments/ID/slug/, /user/name/comments/ID/, /comments/ID
    const i = parts.indexOf("comments");
    const id = parts[i + 1];
    if (i >= 0 && /^[a-z0-9]+$/i.test(id ?? "")) {
      const prefix = i === 2 && (parts[0] === "r" || parts[0] === "user" || parts[0] === "u") ? `/${parts[0]}/${parts[1]}` : "";
      return { provider: "reddit", id, canonicalUrl: `https://www.reddit.com${prefix}/comments/${id}/` };
    }
    return unknown(url);
  }
  if (host === "redd.it") {
    return parts[0] && /^[a-z0-9]+$/i.test(parts[0])
      ? { provider: "reddit", id: parts[0], canonicalUrl: `https://www.reddit.com/comments/${parts[0]}/` }
      : unknown(url);
  }
  if (host === "v.redd.it") {
    // Reddit-hosted video. The id is the post media id; yt-dlp resolves the post from it.
    return parts[0]
      ? { provider: "reddit", id: parts[0], canonicalUrl: `https://v.redd.it/${parts[0]}` }
      : unknown(url);
  }

  // --- Twitch --------------------------------------------------------------------
  if (host === "clips.twitch.tv") {
    // /Slug, /embed?clip=Slug
    const slug = parts[0] === "embed" ? url.searchParams.get("clip") : parts[0];
    return slug ? twitchClip(slug) : unknown(url);
  }
  if (TWITCH_HOSTS.has(host)) {
    // /user/clip/Slug is a clip; /videos/ID is a VOD. A bare /user is a live channel: unknown.
    if (parts[1] === "clip" && parts[2]) {
      return twitchClip(parts[2]);
    }
    if (parts[0] === "videos" && /^\d+$/.test(parts[1] ?? "")) {
      return { provider: "twitch", id: parts[1], canonicalUrl: `https://www.twitch.tv/videos/${parts[1]}` };
    }
    return unknown(url);
  }

  // --- Instagram -----------------------------------------------------------------
  if (INSTAGRAM_HOSTS.has(host)) {
    // /reel/CODE/, /p/CODE/, /reels/CODE/, /tv/CODE/, and /user/reel/CODE/
    const i = parts.findIndex((p) => INSTAGRAM_KINDS.has(p));
    const code = parts[i + 1];
    if (i >= 0 && i <= 1 && /^[A-Za-z0-9_-]+$/.test(code ?? "")) {
      const kind = parts[i] === "p" ? "p" : parts[i] === "tv" ? "tv" : "reel";
      return { provider: "instagram", id: code, canonicalUrl: `https://www.instagram.com/${kind}/${code}/` };
    }
    return unknown(url);
  }

  return unknown(url);
}

function youtube(id: string): ParsedVideoUrl {
  if (!YOUTUBE_ID.test(id)) {
    return { provider: "unknown", id: null, canonicalUrl: "" };
  }
  return { provider: "youtube", id, canonicalUrl: `https://www.youtube.com/watch?v=${id}` };
}

function twitchClip(slug: string): ParsedVideoUrl {
  return { provider: "twitch", id: slug, canonicalUrl: `https://clips.twitch.tv/${slug}` };
}

function unknown(url: URL): ParsedVideoUrl {
  return { provider: "unknown", id: null, canonicalUrl: url.toString() };
}

function stripJunk(url: URL): void {
  for (const key of [...url.searchParams.keys()]) {
    if (JUNK_PARAMS.has(key) || key.startsWith("utm_")) {
      url.searchParams.delete(key);
    }
  }
}
