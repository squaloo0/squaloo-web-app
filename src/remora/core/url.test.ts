import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVideoUrl } from "./url.ts";

const YT = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

test("youtube watch URL, with tracking junk stripped", () => {
  const r = parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&si=abc&list=PL123");
  assert.deepEqual(r, { provider: "youtube", id: "dQw4w9WgXcQ", canonicalUrl: YT });
});

test("youtu.be and shorts resolve to the same canonical URL", () => {
  assert.equal(parseVideoUrl("https://youtu.be/dQw4w9WgXcQ?si=x")?.canonicalUrl, YT);
  assert.equal(parseVideoUrl("https://m.youtube.com/shorts/dQw4w9WgXcQ")?.canonicalUrl, YT);
});

test("vimeo", () => {
  assert.equal(parseVideoUrl("https://vimeo.com/76979871")?.provider, "vimeo");
  assert.equal(parseVideoUrl("https://player.vimeo.com/video/76979871")?.id, "76979871");
});

test("direct file", () => {
  const r = parseVideoUrl("https://example.com/clips/a.MP4#t=3");
  assert.equal(r?.provider, "direct");
  assert.equal(r?.canonicalUrl, "https://example.com/clips/a.MP4");
});

test("not a URL, wrong scheme, or a bad id", () => {
  assert.equal(parseVideoUrl("hello"), null);
  assert.equal(parseVideoUrl("ftp://x/y.mp4"), null);
  assert.equal(parseVideoUrl("https://youtu.be/short")?.provider, "unknown");
});
