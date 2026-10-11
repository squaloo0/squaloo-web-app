import { test } from "node:test";
import assert from "node:assert/strict";
import { estimate, formatSelector, mergeContainer, parseQuality } from "./format.ts";
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
  assert.equal(parseQuality("m4a"), "audio");
  assert.equal(parseQuality("999"), null);
  assert.equal(parseQuality("potato"), null);
});

test("selectors", () => {
  assert.equal(formatSelector("best"), "bestvideo*+bestaudio/best");
  assert.equal(formatSelector("720"), "bestvideo*[height<=720]+bestaudio/best[height<=720]/best");
  assert.equal(formatSelector("audio"), "bestaudio/best");
  assert.equal(mergeContainer("best"), "mp4");
  assert.equal(mergeContainer("audio"), null);
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
