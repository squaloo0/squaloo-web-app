import { test } from "node:test";
import assert from "node:assert/strict";
import { THUMBS_FRAMES, thumbsFileName, thumbsPlan } from "./thumbs.ts";
import { expectedExt, formatSelector, mergeContainer, parseQuality, postprocessArgs } from "./format.ts";
import { GIF_FORMAT_SELECTOR } from "./gif.ts";

test("a plan samples twelve frames evenly and tiles them, as one argument list", () => {
  const p = thumbsPlan("/tmp/in.mp4", "/tmp/out.jpg", 22)!;
  assert.equal(THUMBS_FRAMES, 12);
  assert.ok(Math.abs(p.step - 22 / 12) < 1e-9);
  assert.equal(p.args[0], "-y");
  assert.equal(p.args[p.args.indexOf("-i") + 1], "/tmp/in.mp4");
  assert.equal(p.args[p.args.indexOf("-vf") + 1], "fps=1/1.8333,scale=320:-2,tile=4x3");
  assert.equal(p.args[p.args.indexOf("-frames:v") + 1], "1");
  assert.equal(p.args.at(-1), "/tmp/out.jpg");
  assert.ok(!p.args.some((a) => a.includes(" ") && !a.startsWith("/")), "no shell-ish arguments");
});

test("too short, or no duration, is refused", () => {
  assert.equal(thumbsPlan("a", "b", 0.5), null);
  assert.equal(thumbsPlan("a", "b", NaN), null);
  assert.equal(thumbsPlan("a", "b", Infinity), null);
});

test("file names and the dial", () => {
  assert.equal(thumbsFileName("Rick [id] clip 83-105.mp4"), "Rick [id] clip 83-105.thumbs.jpg");
  assert.equal(thumbsFileName("noext"), "noext.thumbs.jpg");
  assert.equal(parseQuality("thumbs"), "thumbs");
  assert.equal(parseQuality("contact"), "thumbs");
  assert.equal(formatSelector("thumbs"), GIF_FORMAT_SELECTOR, "a low-res video-only source, like a GIF");
  assert.equal(mergeContainer("thumbs"), null);
  assert.deepEqual(postprocessArgs("thumbs"), [], "yt-dlp does nothing special; Remora tiles it");
  assert.equal(expectedExt("thumbs"), "jpg");
});
