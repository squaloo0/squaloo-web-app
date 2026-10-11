import { test } from "node:test";
import assert from "node:assert/strict";
import { prettyBytes, prettyDuration, prettyHeight } from "./pretty.ts";

test("durations print like a clock", () => {
  assert.equal(prettyDuration(0), "0:00");
  assert.equal(prettyDuration(7), "0:07");
  assert.equal(prettyDuration(213), "3:33");
  assert.equal(prettyDuration(3725), "1:02:05");
  assert.equal(prettyDuration(212.6), "3:33");
  assert.equal(prettyDuration(null), "—");
});

test("bytes print in binary units with a tilde for estimates", () => {
  assert.equal(prettyBytes(0), "0 B");
  assert.equal(prettyBytes(512), "512 B");
  assert.equal(prettyBytes(1536), "1.5 KB");
  assert.equal(prettyBytes(122168277), "116.5 MB");
  assert.equal(prettyBytes(358608461), "342.0 MB");
  assert.equal(prettyBytes(5 * 1024 ** 3), "5.0 GB");
  assert.equal(prettyBytes(122168277, true), "~116.5 MB");
  assert.equal(prettyBytes(null), "—");
});

test("heights", () => {
  assert.equal(prettyHeight(1080), "1080p");
  assert.equal(prettyHeight(null), "audio");
});
