/**
 * Ugly URLs and what the glass should read off them.
 *
 * This list is the spec for `parseVideoUrl`. Add a row before touching the parser:
 * if a customer pasted it and the machine got it wrong, it belongs here forever.
 */
import type { ParsedVideoUrl } from "./url.ts";

export type UrlFixture = {
  name: string;
  input: string;
  expect: ParsedVideoUrl | null;
};

const YT = (id: string): ParsedVideoUrl => ({
  provider: "youtube",
  id,
  canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
});
const VIMEO = (id: string, unlisted?: string): ParsedVideoUrl => ({
  provider: "vimeo",
  id,
  canonicalUrl: unlisted ? `https://vimeo.com/${id}/${unlisted}` : `https://vimeo.com/${id}`,
});
const UNKNOWN = (canonicalUrl: string): ParsedVideoUrl => ({ provider: "unknown", id: null, canonicalUrl });

export const URL_FIXTURES: UrlFixture[] = [
  // --- not a video URL at all --------------------------------------------------
  { name: "plain words", input: "hello", expect: null },
  { name: "empty string", input: "", expect: null },
  { name: "whitespace only", input: "   ", expect: null },
  { name: "ftp scheme", input: "ftp://x/y.mp4", expect: null },
  { name: "javascript scheme", input: "javascript:alert(1)", expect: null },
  { name: "mailto", input: "mailto:a@b.c", expect: null },

  // --- YouTube, every spelling -------------------------------------------------
  { name: "yt watch, clean", input: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", expect: YT("dQw4w9WgXcQ") },
  {
    name: "yt watch with share id, start time, and playlist junk",
    input: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&si=abc&list=PL123&index=4",
    expect: YT("dQw4w9WgXcQ"),
  },
  {
    name: "yt watch, v is not the first param",
    input: "https://www.youtube.com/watch?feature=share&app=desktop&v=dQw4w9WgXcQ",
    expect: YT("dQw4w9WgXcQ"),
  },
  { name: "yt watch, utm soup", input: "https://youtube.com/watch?v=dQw4w9WgXcQ&utm_source=x&utm_medium=y&fbclid=z", expect: YT("dQw4w9WgXcQ") },
  { name: "yt watch, no www", input: "https://youtube.com/watch?v=dQw4w9WgXcQ", expect: YT("dQw4w9WgXcQ") },
  { name: "yt watch, http", input: "http://www.youtube.com/watch?v=dQw4w9WgXcQ", expect: YT("dQw4w9WgXcQ") },
  { name: "yt watch, SHOUTED HOST", input: "https://WWW.YOUTUBE.COM/watch?v=dQw4w9WgXcQ", expect: YT("dQw4w9WgXcQ") },
  { name: "yt watch, surrounding whitespace", input: "  https://www.youtube.com/watch?v=dQw4w9WgXcQ \n", expect: YT("dQw4w9WgXcQ") },
  { name: "yt watch, hash fragment", input: "https://www.youtube.com/watch?v=dQw4w9WgXcQ#t=10", expect: YT("dQw4w9WgXcQ") },
  { name: "yt watch, path form", input: "https://www.youtube.com/watch/dQw4w9WgXcQ", expect: YT("dQw4w9WgXcQ") },
  { name: "yt mobile", input: "https://m.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUF", expect: YT("dQw4w9WgXcQ") },
  { name: "yt music", input: "https://music.youtube.com/watch?v=dQw4w9WgXcQ&list=RDAMVM", expect: YT("dQw4w9WgXcQ") },
  { name: "youtu.be", input: "https://youtu.be/dQw4w9WgXcQ", expect: YT("dQw4w9WgXcQ") },
  { name: "youtu.be with share id and time", input: "https://youtu.be/dQw4w9WgXcQ?si=x&t=7", expect: YT("dQw4w9WgXcQ") },
  { name: "youtu.be trailing slash", input: "https://youtu.be/dQw4w9WgXcQ/", expect: YT("dQw4w9WgXcQ") },
  { name: "yt shorts", input: "https://www.youtube.com/shorts/dQw4w9WgXcQ", expect: YT("dQw4w9WgXcQ") },
  { name: "yt shorts, mobile, feature", input: "https://m.youtube.com/shorts/dQw4w9WgXcQ?feature=share", expect: YT("dQw4w9WgXcQ") },
  { name: "yt embed", input: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1", expect: YT("dQw4w9WgXcQ") },
  { name: "yt nocookie embed", input: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0", expect: YT("dQw4w9WgXcQ") },
  { name: "yt live", input: "https://www.youtube.com/live/dQw4w9WgXcQ?feature=shared", expect: YT("dQw4w9WgXcQ") },
  { name: "yt old /v/ form", input: "https://www.youtube.com/v/dQw4w9WgXcQ", expect: YT("dQw4w9WgXcQ") },
  { name: "yt id with dash and underscore", input: "https://youtu.be/a-b_C1D2e3F", expect: YT("a-b_C1D2e3F") },
  { name: "yt id too short", input: "https://youtu.be/short", expect: { provider: "unknown", id: null, canonicalUrl: "" } },
  { name: "yt watch without v", input: "https://www.youtube.com/watch", expect: { provider: "unknown", id: null, canonicalUrl: "" } },
  { name: "yt playlist is not one video", input: "https://www.youtube.com/playlist?list=PL123", expect: UNKNOWN("https://www.youtube.com/playlist") },
  { name: "yt channel is not a video", input: "https://www.youtube.com/@squaloo", expect: UNKNOWN("https://www.youtube.com/@squaloo") },

  // --- Vimeo -------------------------------------------------------------------
  { name: "vimeo", input: "https://vimeo.com/76979871", expect: VIMEO("76979871") },
  { name: "vimeo www", input: "https://www.vimeo.com/76979871", expect: VIMEO("76979871") },
  { name: "vimeo player", input: "https://player.vimeo.com/video/76979871?title=0&byline=0", expect: VIMEO("76979871") },
  { name: "vimeo channel path", input: "https://vimeo.com/channels/staffpicks/76979871", expect: VIMEO("76979871") },
  { name: "vimeo group path", input: "https://vimeo.com/groups/shortfilms/videos/76979871", expect: VIMEO("76979871") },
  { name: "vimeo unlisted hash in path", input: "https://vimeo.com/76979871/abcdef0123", expect: VIMEO("76979871", "abcdef0123") },
  { name: "vimeo unlisted hash in player query", input: "https://player.vimeo.com/video/76979871?h=abcdef0123", expect: VIMEO("76979871", "abcdef0123") },
  { name: "vimeo user page is not a video", input: "https://vimeo.com/squaloo", expect: UNKNOWN("https://vimeo.com/squaloo") },

  // --- TikTok ------------------------------------------------------------------
  {
    name: "tiktok video",
    input: "https://www.tiktok.com/@scout2015/video/6718335390845095173",
    expect: { provider: "tiktok", id: "6718335390845095173", canonicalUrl: "https://www.tiktok.com/@scout2015/video/6718335390845095173" },
  },
  {
    name: "tiktok video, share soup",
    input: "https://www.tiktok.com/@scout2015/video/6718335390845095173?is_from_webapp=1&sender_device=pc&web_id=123&_r=1&_t=xyz",
    expect: { provider: "tiktok", id: "6718335390845095173", canonicalUrl: "https://www.tiktok.com/@scout2015/video/6718335390845095173" },
  },
  {
    name: "tiktok photo post",
    input: "https://www.tiktok.com/@scout2015/photo/6718335390845095173",
    expect: { provider: "tiktok", id: "6718335390845095173", canonicalUrl: "https://www.tiktok.com/@scout2015/photo/6718335390845095173" },
  },
  { name: "tiktok embed", input: "https://www.tiktok.com/embed/6718335390845095173", expect: { provider: "tiktok", id: "6718335390845095173", canonicalUrl: "https://www.tiktok.com/embed/6718335390845095173" } },
  { name: "tiktok vm short link, id behind a redirect", input: "https://vm.tiktok.com/ZMabc123/", expect: { provider: "tiktok", id: null, canonicalUrl: "https://vm.tiktok.com/ZMabc123" } },
  { name: "tiktok vt short link", input: "https://vt.tiktok.com/ZSabc123/?k=1", expect: { provider: "tiktok", id: null, canonicalUrl: "https://vt.tiktok.com/ZSabc123" } },
  { name: "tiktok /t/ short link", input: "https://www.tiktok.com/t/ZTabc123/", expect: { provider: "tiktok", id: null, canonicalUrl: "https://www.tiktok.com/t/ZTabc123" } },
  { name: "tiktok profile is not a video", input: "https://www.tiktok.com/@scout2015", expect: UNKNOWN("https://www.tiktok.com/@scout2015") },

  // --- X / Twitter ----------------------------------------------------------------
  { name: "x status", input: "https://x.com/NASA/status/1234567890123456789", expect: { provider: "x", id: "1234567890123456789", canonicalUrl: "https://x.com/NASA/status/1234567890123456789" } },
  { name: "x status, share soup", input: "https://x.com/NASA/status/1234567890123456789?s=20&t=abc&ref_src=twsrc", expect: { provider: "x", id: "1234567890123456789", canonicalUrl: "https://x.com/NASA/status/1234567890123456789" } },
  { name: "twitter.com status", input: "https://twitter.com/NASA/status/1234567890123456789", expect: { provider: "x", id: "1234567890123456789", canonicalUrl: "https://x.com/NASA/status/1234567890123456789" } },
  { name: "mobile.twitter.com status", input: "https://mobile.twitter.com/NASA/status/1234567890123456789/video/1", expect: { provider: "x", id: "1234567890123456789", canonicalUrl: "https://x.com/NASA/status/1234567890123456789" } },
  { name: "x /i/status, no user", input: "https://x.com/i/status/1234567890123456789", expect: { provider: "x", id: "1234567890123456789", canonicalUrl: "https://x.com/i/status/1234567890123456789" } },
  { name: "x /i/web/status", input: "https://twitter.com/i/web/status/1234567890123456789", expect: { provider: "x", id: "1234567890123456789", canonicalUrl: "https://x.com/i/status/1234567890123456789" } },
  { name: "x profile is not a video", input: "https://x.com/NASA", expect: UNKNOWN("https://x.com/NASA") },

  // --- Reddit --------------------------------------------------------------------
  {
    name: "reddit post",
    input: "https://www.reddit.com/r/videos/comments/abc123/some_title_here/",
    expect: { provider: "reddit", id: "abc123", canonicalUrl: "https://www.reddit.com/r/videos/comments/abc123/" },
  },
  {
    name: "reddit post, old. host and utm",
    input: "https://old.reddit.com/r/videos/comments/abc123/some_title_here?utm_source=share&utm_medium=web2x",
    expect: { provider: "reddit", id: "abc123", canonicalUrl: "https://www.reddit.com/r/videos/comments/abc123/" },
  },
  { name: "reddit user post", input: "https://www.reddit.com/user/someone/comments/abc123/title/", expect: { provider: "reddit", id: "abc123", canonicalUrl: "https://www.reddit.com/user/someone/comments/abc123/" } },
  { name: "reddit bare comments", input: "https://www.reddit.com/comments/abc123", expect: { provider: "reddit", id: "abc123", canonicalUrl: "https://www.reddit.com/comments/abc123/" } },
  { name: "redd.it short", input: "https://redd.it/abc123", expect: { provider: "reddit", id: "abc123", canonicalUrl: "https://www.reddit.com/comments/abc123/" } },
  { name: "v.redd.it media", input: "https://v.redd.it/xyz789?source=fallback", expect: { provider: "reddit", id: "xyz789", canonicalUrl: "https://v.redd.it/xyz789" } },
  { name: "subreddit is not a video", input: "https://www.reddit.com/r/videos/", expect: UNKNOWN("https://www.reddit.com/r/videos/") },

  // --- Twitch --------------------------------------------------------------------
  { name: "twitch clip", input: "https://clips.twitch.tv/AwkwardHelplessSalamanderSwiftRage", expect: { provider: "twitch", id: "AwkwardHelplessSalamanderSwiftRage", canonicalUrl: "https://clips.twitch.tv/AwkwardHelplessSalamanderSwiftRage" } },
  { name: "twitch clip via channel", input: "https://www.twitch.tv/somechannel/clip/AwkwardHelplessSalamanderSwiftRage?filter=clips&range=7d&sort=time", expect: { provider: "twitch", id: "AwkwardHelplessSalamanderSwiftRage", canonicalUrl: "https://clips.twitch.tv/AwkwardHelplessSalamanderSwiftRage" } },
  { name: "twitch clip embed", input: "https://clips.twitch.tv/embed?clip=AwkwardHelplessSalamanderSwiftRage&parent=example.com", expect: { provider: "twitch", id: "AwkwardHelplessSalamanderSwiftRage", canonicalUrl: "https://clips.twitch.tv/AwkwardHelplessSalamanderSwiftRage" } },
  { name: "twitch vod", input: "https://www.twitch.tv/videos/1234567890?t=1h2m3s", expect: { provider: "twitch", id: "1234567890", canonicalUrl: "https://www.twitch.tv/videos/1234567890" } },
  { name: "twitch live channel is not a video", input: "https://www.twitch.tv/somechannel", expect: UNKNOWN("https://www.twitch.tv/somechannel") },

  // --- Instagram -------------------------------------------------------------------
  { name: "instagram reel", input: "https://www.instagram.com/reel/CxYzAbC123_/", expect: { provider: "instagram", id: "CxYzAbC123_", canonicalUrl: "https://www.instagram.com/reel/CxYzAbC123_/" } },
  { name: "instagram reel, igsh junk", input: "https://www.instagram.com/reel/CxYzAbC123_/?igsh=abc&utm_source=ig_web_copy_link", expect: { provider: "instagram", id: "CxYzAbC123_", canonicalUrl: "https://www.instagram.com/reel/CxYzAbC123_/" } },
  { name: "instagram reels plural", input: "https://instagram.com/reels/CxYzAbC123_", expect: { provider: "instagram", id: "CxYzAbC123_", canonicalUrl: "https://www.instagram.com/reel/CxYzAbC123_/" } },
  { name: "instagram user reel", input: "https://www.instagram.com/someone/reel/CxYzAbC123_/", expect: { provider: "instagram", id: "CxYzAbC123_", canonicalUrl: "https://www.instagram.com/reel/CxYzAbC123_/" } },
  { name: "instagram post", input: "https://www.instagram.com/p/CxYzAbC123_/", expect: { provider: "instagram", id: "CxYzAbC123_", canonicalUrl: "https://www.instagram.com/p/CxYzAbC123_/" } },
  { name: "instagram tv", input: "https://www.instagram.com/tv/CxYzAbC123_/", expect: { provider: "instagram", id: "CxYzAbC123_", canonicalUrl: "https://www.instagram.com/tv/CxYzAbC123_/" } },
  { name: "instagram profile is not a video", input: "https://www.instagram.com/someone/", expect: UNKNOWN("https://www.instagram.com/someone/") },

  // --- direct files --------------------------------------------------------------------
  { name: "direct mp4, hash dropped", input: "https://example.com/clips/a.MP4#t=3", expect: { provider: "direct", id: null, canonicalUrl: "https://example.com/clips/a.MP4" } },
  { name: "direct webm", input: "https://cdn.example.com/x/y/z.webm", expect: { provider: "direct", id: null, canonicalUrl: "https://cdn.example.com/x/y/z.webm" } },
  { name: "direct mov", input: "http://example.com/a.mov", expect: { provider: "direct", id: null, canonicalUrl: "http://example.com/a.mov" } },
  {
    name: "direct signed URL keeps its query, even junk-looking keys",
    input: "https://files.example.com/v.mp4?s=sig123&t=1700000000&X-Amz-Signature=abc",
    expect: { provider: "direct", id: null, canonicalUrl: "https://files.example.com/v.mp4?s=sig123&t=1700000000&X-Amz-Signature=abc" },
  },

  // --- somewhere else entirely --------------------------------------------------------
  { name: "unknown host, junk stripped, rest kept", input: "https://example.com/watch?v=abc&utm_source=x&page=2", expect: UNKNOWN("https://example.com/watch?v=abc&page=2") },
  { name: "unknown host, html page", input: "https://news.example.com/story/123", expect: UNKNOWN("https://news.example.com/story/123") },
];
