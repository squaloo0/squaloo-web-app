import { test } from "node:test";
import assert from "node:assert/strict";
import { GIF_FORMAT_SELECTOR, gifClipReason, gifPostprocessArgs, MAX_GIF_SECONDS } from "./gif.ts";
import { expectedExt, formatSelector, isAudio, mergeContainer, parseQuality, postprocessArgs } from "./format.ts";

test("a GIF is a short clip, rendered through a palette", () => {
  assert.equal(gifClipReason(null), "a GIF is a clip: give it a start and an end");
  assert.equal(gifClipReason({ start: 0, end: MAX_GIF_SECONDS + 1 }), `a GIF is at most ${MAX_GIF_SECONDS} seconds`);
  assert.equal(gifClipReason({ start: 83, end: 88 }), null);
  const args = gifPostprocessArgs();
  assert.equal(args[0], "--recode-video");
  assert.equal(args[1], "gif");
  assert.equal(args[2], "--postprocessor-args");
  assert.ok(args[3].startsWith("VideoConvertor:-vf fps=15,scale=480:-1:flags=lanczos,split"));
  assert.ok(args[3].includes("palettegen") && args[3].includes("paletteuse"));
  assert.ok(args[3].endsWith(" -loop 0"));
  assert.equal(args.length, 4, "one filter graph, one argument, no shell");
});

test("gif is a quality on the dial", () => {
  assert.equal(parseQuality("gif"), "gif");
  assert.equal(parseQuality("GIF"), "gif");
  assert.equal(formatSelector("gif"), GIF_FORMAT_SELECTOR);
  assert.equal(mergeContainer("gif"), null);
  assert.deepEqual(postprocessArgs("gif"), gifPostprocessArgs());
  assert.equal(expectedExt("gif"), "gif");
  assert.equal(isAudio("gif"), false);
});
