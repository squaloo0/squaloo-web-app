import { test } from "node:test";
import assert from "node:assert/strict";
import { clipArgs, clipTag, MAX_CLIP_SECONDS, parseClip, parseClipSpec, parseTime, prettyClip, prettyTime } from "./clip.ts";

test("times the way people type them", () => {
  assert.equal(parseTime("83"), 83);
  assert.equal(parseTime("1:23"), 83);
  assert.equal(parseTime("01:23"), 83);
  assert.equal(parseTime("1:02:03"), 3723);
  assert.equal(parseTime("83.5"), 83.5);
  assert.equal(parseTime("0:00"), 0);
  assert.equal(parseTime(" 1:23 "), 83);
  assert.equal(parseTime(""), null);
  assert.equal(parseTime(undefined), null);
  assert.equal(parseTime("abc"), null);
  assert.equal(parseTime("1:2:3:4"), null);
  assert.equal(parseTime("-5"), null);
});

test("a clip has an end after its start and a sensible length", () => {
  assert.deepEqual(parseClip("1:23", "1:45"), { ok: true, clip: { start: 83, end: 105 } });
  assert.deepEqual(parseClip("", ""), null, "no clip asked for");
  assert.equal(parseClip("1:45", "1:23")?.ok, false);
  assert.equal(parseClip("10", "10.5")?.ok, false, "too short");
  assert.equal(parseClip("0", String(MAX_CLIP_SECONDS + 1))?.ok, false, "too long");
  assert.equal(parseClip("0", String(MAX_CLIP_SECONDS))?.ok, true);
  assert.equal(parseClip("x", "5")?.ok, false);
  assert.equal(parseClip("5", "")?.ok, false, "half a clip");
  assert.deepEqual(parseClipSpec("1:23-1:45"), { ok: true, clip: { start: 83, end: 105 } });
  assert.equal(parseClipSpec("1:23")?.ok, false);
  assert.equal(parseClipSpec(""), null);
});

test("yt-dlp arguments, pretty forms, file tag", () => {
  assert.deepEqual(clipArgs({ start: 83, end: 105 }), ["--download-sections", "*83-105", "--force-keyframes-at-cuts"]);
  assert.deepEqual(clipArgs({ start: 83.5, end: 105 }), ["--download-sections", "*83.5-105", "--force-keyframes-at-cuts"]);
  assert.equal(prettyTime(83), "1:23");
  assert.equal(prettyTime(3723), "1:02:03");
  assert.equal(prettyTime(5.5), "0:05.5");
  assert.equal(prettyClip({ start: 83, end: 105 }), "1:23–1:45 (22s)");
  assert.equal(prettyClip({ start: 0, end: 600 }), "0:00–10:00 (10:00)");
  assert.equal(clipTag({ start: 83.5, end: 104.2 }), "clip 83-105");
});
