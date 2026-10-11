import { test } from "node:test";
import assert from "node:assert/strict";
import { MetaError, parseYtDlpJson } from "./meta.ts";
import { YTDLP_YOUTUBE_FIXTURE } from "./meta.fixture.ts";

function fixture(patch: Record<string, unknown> = {}): Record<string, unknown> {
  return { ...(YTDLP_YOUTUBE_FIXTURE as Record<string, unknown>), ...patch };
}

test("a real youtube dump narrows to a VideoMeta", () => {
  const m = parseYtDlpJson(YTDLP_YOUTUBE_FIXTURE);
  assert.equal(m.id, "dQw4w9WgXcQ");
  assert.equal(m.title, "Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)");
  assert.equal(m.uploader, "Rick Astley");
  assert.equal(m.duration, 213);
  assert.equal(m.uploadDate, "2009-10-25");
  assert.equal(m.thumbnail, "https://i.ytimg.com/vi_webp/dQw4w9WgXcQ/maxresdefault.webp");
  assert.equal(m.webpageUrl, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  assert.equal(m.extractor, "youtube");
  assert.equal(m.isLive, false);
  assert.equal(m.formats.length, 8);
});

test("the same dump as raw JSON text parses identically", () => {
  const text = JSON.stringify(YTDLP_YOUTUBE_FIXTURE);
  assert.deepEqual(parseYtDlpJson(text), parseYtDlpJson(YTDLP_YOUTUBE_FIXTURE));
});

test("formats: codecs, sizes and the approx flag", () => {
  const m = parseYtDlpJson(YTDLP_YOUTUBE_FIXTURE);
  const byId = Object.fromEntries(m.formats.map((f) => [f.formatId, f]));

  // audio-only: yt-dlp says vcodec "none", we say null
  assert.equal(byId["249"].vcodec, null);
  assert.equal(byId["249"].height, null);
  assert.ok(byId["249"].acodec);

  // video-only, exact size wins over the estimate
  assert.equal(byId["137"].acodec, null);
  assert.equal(byId["137"].height, 1080);
  assert.equal(byId["137"].bytesApprox, false);
  assert.ok((byId["137"].bytes ?? 0) > 0);

  // HLS rendition: no size at all
  assert.equal(byId["625"].bytes, null);
  assert.equal(byId["625"].bytesApprox, false);
  assert.equal(byId["625"].protocol, "m3u8_native");

  // muxed: both tracks
  assert.ok(byId["18"].vcodec && byId["18"].acodec);
});

test("filesize_approx is used when filesize is missing, and flagged", () => {
  const m = parseYtDlpJson(
    fixture({ formats: [{ format_id: "x", ext: "mp4", filesize_approx: 1000, vcodec: "avc1", acodec: "mp4a" }] }),
  );
  assert.equal(m.formats[0].bytes, 1000);
  assert.equal(m.formats[0].bytesApprox, true);
});

test("permissive: unknown keys are ignored, optional keys may be absent", () => {
  const m = parseYtDlpJson({ id: "x", title: "t", extractor: "Generic", nine_hundred_other_keys: { yes: true } });
  assert.equal(m.title, "t");
  assert.equal(m.extractor, "generic");
  assert.equal(m.uploader, null);
  assert.equal(m.duration, null);
  assert.equal(m.uploadDate, null);
  assert.equal(m.thumbnail, null);
  assert.deepEqual(m.formats, []);
});

test("uploader falls back to channel, then uploader_id", () => {
  assert.equal(parseYtDlpJson({ id: "x", title: "t", channel: "C" }).uploader, "C");
  assert.equal(parseYtDlpJson({ id: "x", title: "t", uploader_id: "@u" }).uploader, "@u");
});

test("live streams are flagged either way yt-dlp says it", () => {
  assert.equal(parseYtDlpJson({ id: "x", title: "t", is_live: true }).isLive, true);
  assert.equal(parseYtDlpJson({ id: "x", title: "t", live_status: "is_live" }).isLive, true);
  assert.equal(parseYtDlpJson({ id: "x", title: "t", live_status: "not_live" }).isLive, false);
});

test("strict: the few required fields throw with a path", () => {
  assert.throws(() => parseYtDlpJson(fixture({ title: undefined })), (e: unknown) => e instanceof MetaError && e.path === "title");
  assert.throws(() => parseYtDlpJson(fixture({ title: "" })), (e: unknown) => e instanceof MetaError && e.path === "title");
  assert.throws(() => parseYtDlpJson(fixture({ id: 42 })), (e: unknown) => e instanceof MetaError && e.path === "id");
  assert.throws(
    () => parseYtDlpJson(fixture({ formats: [{ ext: "mp4" }] })),
    (e: unknown) => e instanceof MetaError && e.path === "formats[0].format_id",
  );
  assert.throws(() => parseYtDlpJson(fixture({ formats: "nope" })), (e: unknown) => e instanceof MetaError && e.path === "formats");
  assert.throws(() => parseYtDlpJson(fixture({ upload_date: "2009-10-25" })), (e: unknown) => e instanceof MetaError && e.path === "upload_date");
  assert.throws(() => parseYtDlpJson("{not json"), (e: unknown) => e instanceof MetaError && e.path === "$");
  assert.throws(() => parseYtDlpJson(null), MetaError);
  assert.throws(() => parseYtDlpJson([]), MetaError);
});
