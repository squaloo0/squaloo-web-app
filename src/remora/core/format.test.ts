import { test } from "node:test";
import assert from "node:assert/strict";
import { estimate, expectedExt, formatSelector, isAudio, mergeContainer, parseQuality, postprocessArgs } from "./format.ts";
import { parseYtDlpJson } from "./meta.ts";
import { YTDLP_YOUTUBE_FIXTURE } from "./meta.fixture.ts";

test("quality parsing is forgiving about spelling", () => {
  assert.equal(parseQuality(undefined), "best");
  assert.equal(parseQuality(""), "best");
  assert.equal(parseQuality(" BEST "), "best");
  assert.equal(parseQuality("1080"), "1080");
  assert.equal(parseQuality("1080p"), "1080");
  assert.equal(parseQuality("4k"), "2160");
  assert.equal(parseQuality("audio"), "audio");
  assert.equal(parseQuality("mp3"), "audio");
  assert.equal(parseQuality("m4a"), "m4a");
  assert.equal(parseQuality("aac"), "m4a");
  assert.equal(parseQuality("raw"), "audio-raw");
  assert.equal(parseQuality("audio-raw"), "audio-raw");
  assert.equal(parseQuality("999"), null);
  assert.equal(parseQuality("potato"), null);
});

test("selectors", () => {
  assert.equal(formatSelector("best"), "bestvideo*+bestaudio/best");
  assert.equal(formatSelector("720"), "bestvideo*[height<=720]+bestaudio/best[height<=720]/best");
  assert.equal(formatSelector("audio"), "bestaudio/best");
  assert.equal(formatSelector("m4a"), "bestaudio/best");
  assert.equal(mergeContainer("best"), "mp4");
  assert.equal(mergeContainer("audio"), null);
  assert.equal(mergeContainer("audio-raw"), null);
});

test("the AUDIO slot is a post-process, raw is not", () => {
  assert.deepEqual(postprocessArgs("audio"), ["--extract-audio", "--audio-format", "mp3", "--audio-quality", "0"]);
  assert.deepEqual(postprocessArgs("m4a"), ["--extract-audio", "--audio-format", "m4a"]);
  assert.deepEqual(postprocessArgs("audio-raw"), []);
  assert.deepEqual(postprocessArgs("720"), []);
  assert.equal(isAudio("audio"), true);
  assert.equal(isAudio("m4a"), true);
  assert.equal(isAudio("audio-raw"), true);
  assert.equal(isAudio("best"), false);
  assert.equal(expectedExt("audio"), "mp3");
  assert.equal(expectedExt("m4a"), "m4a");
  assert.equal(expectedExt("audio-raw"), null);
  assert.equal(expectedExt("1080"), "mp4");
});

test("estimates from the real fixture land in the right neighbourhood", () => {
  const meta = parseYtDlpJson(YTDLP_YOUTUBE_FIXTURE);

  const best = estimate(meta, "best")!;
  assert.equal(best.height, 2160);
  assert.deepEqual(best.formatIds, ["313", "140"]); // vp9 2160p by bytes + m4a audio
  assert.equal(best.bytes, 358608461 + 3449447);
  assert.equal(best.approx, false);

  const hd = estimate(meta, "1080")!;
  assert.equal(hd.height, 1080);
  assert.deepEqual(hd.formatIds, ["137", "140"]);

  const audio = estimate(meta, "audio")!;
  assert.equal(audio.height, null);
  assert.equal(audio.formatIds[0], "140");
  assert.equal(audio.approx, true, "a transcode changes the size");
  assert.equal(estimate(meta, "audio-raw")!.approx, false, "raw keeps the source size");

  // nothing video-only at or under 240p in the fixture: fall back to the muxed 360p
  const tiny = estimate(meta, "360")!;
  assert.deepEqual(tiny.formatIds, ["18"]);
  assert.equal(tiny.approx, true);
});

test("estimate is null when there is nothing to pick", () => {
  const meta = parseYtDlpJson({ id: "x", title: "t" });
  assert.equal(estimate(meta, "best"), null);
  assert.equal(estimate(meta, "audio"), null);
});
