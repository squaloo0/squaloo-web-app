import { test } from "node:test";
import assert from "node:assert/strict";
import { isThumbUrl, oembedEndpoint, parseOembed, thumbProxyPath } from "./oembed.ts";
import { parseVideoUrl } from "./url.ts";

test("youtube and vimeo have windows; the others do not yet", () => {
  assert.equal(
    oembedEndpoint(parseVideoUrl("https://youtu.be/dQw4w9WgXcQ")!),
    "https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DdQw4w9WgXcQ&format=json",
  );
  assert.equal(
    oembedEndpoint(parseVideoUrl("https://player.vimeo.com/video/76979871")!),
    "https://vimeo.com/api/oembed.json?url=https%3A%2F%2Fvimeo.com%2F76979871",
  );
  assert.equal(oembedEndpoint(parseVideoUrl("https://www.tiktok.com/@a/video/123")!), null);
  assert.equal(oembedEndpoint(parseVideoUrl("https://example.com/a.mp4")!), null);
  assert.equal(oembedEndpoint(parseVideoUrl("https://example.com/page")!), null);
  // a recognised host with a bad id has an empty canonical URL: no window either
  assert.equal(oembedEndpoint(parseVideoUrl("https://youtu.be/short")!), null);
});

test("an oEmbed answer narrows to title, author, thumbnail", () => {
  const real = {
    title: "Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)",
    author_name: "Rick Astley",
    author_url: "https://www.youtube.com/@RickAstleyYT",
    type: "video",
    height: 113,
    width: 200,
    version: "1.0",
    provider_name: "YouTube",
    thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    html: "<iframe ...></iframe>",
  };
  assert.deepEqual(parseOembed(real), {
    title: real.title,
    author: "Rick Astley",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  });
});

test("missing bits are null; no title is no answer", () => {
  assert.deepEqual(parseOembed({ title: "t" }), { title: "t", author: null, thumbnail: null });
  assert.equal(parseOembed({ author_name: "a" }), null);
  assert.equal(parseOembed({ title: "" }), null);
  assert.equal(parseOembed("nope"), null);
  assert.equal(parseOembed(null), null);
  assert.equal(parseOembed([]), null);
});

test("a thumbnail off the allowlist is dropped, not proxied", () => {
  const sneaky = parseOembed({ title: "t", thumbnail_url: "https://evil.example/x.jpg" });
  assert.equal(sneaky?.thumbnail, null);
  assert.equal(isThumbUrl("http://i.ytimg.com/vi/x/hq.jpg"), false, "https only");
  assert.equal(isThumbUrl("https://i.vimeocdn.com/video/1_640.jpg"), true);
  assert.equal(isThumbUrl("https://I.YTIMG.COM/vi/x/hq.jpg"), true);
  assert.equal(isThumbUrl("https://i.ytimg.com.evil.example/x.jpg"), false);
  assert.equal(isThumbUrl("not a url"), false);
});

test("the proxy path is same-origin and round-trips the CDN URL", () => {
  const src = "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg?x=1&y=2";
  const path = thumbProxyPath(src)!;
  assert.ok(path.startsWith("/api/remora/thumb?u="));
  assert.equal(new URL(path, "https://squaloo.com").searchParams.get("u"), src);
  assert.equal(thumbProxyPath(null), null);
  assert.equal(thumbProxyPath("https://evil.example/x.jpg"), null);
});
