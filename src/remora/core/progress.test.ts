import { test } from "node:test";
import assert from "node:assert/strict";
import { fraction, parseProgressLine } from "./progress.ts";

test("a downloading tick with exact total", () => {
  const p = parseProgressLine("remora|downloading|1048576|80911999|80911979|2621440.5|30|/tmp/x/Rick.f137.mp4\n");
  assert.deepEqual(p, {
    kind: "download",
    status: "downloading",
    downloaded: 1048576,
    total: 80911999,
    approx: false,
    speed: 2621440.5,
    eta: 30,
    filename: "/tmp/x/Rick.f137.mp4",
  });
  assert.ok(Math.abs(fraction(p as never)! - 1048576 / 80911999) < 1e-9);
});

test("NA fields become null; an estimate is flagged", () => {
  const p = parseProgressLine("remora|downloading|500|NA|1000|NA|NA|a.webm");
  assert.equal(p?.kind, "download");
  if (p?.kind !== "download") return;
  assert.equal(p.total, 1000);
  assert.equal(p.approx, true);
  assert.equal(p.speed, null);
  assert.equal(p.eta, null);
  assert.equal(fraction(p), 0.5);
});

test("no total at all means no fraction", () => {
  const p = parseProgressLine("remora|downloading|500|NA|NA|NA|NA|a.webm");
  assert.equal(p?.kind === "download" && fraction(p), null);
});

test("finished is 1 regardless", () => {
  const p = parseProgressLine("remora|finished|80911999|80911999|NA|NA|NA|a.mp4");
  assert.equal(p?.kind === "download" && fraction(p), 1);
});

test("a filename containing the separator survives", () => {
  const p = parseProgressLine("remora|downloading|1|2|NA|NA|NA|/tmp/a|b.mp4");
  assert.equal(p?.kind === "download" && p.filename, "/tmp/a|b.mp4");
});

test("postprocessor ticks", () => {
  assert.deepEqual(parseProgressLine("remora-pp|started|Merger"), { kind: "postprocess", status: "started", processor: "Merger" });
  assert.deepEqual(parseProgressLine("remora-pp|finished|Merger"), { kind: "postprocess", status: "finished", processor: "Merger" });
});

test("lines that are not ours are ignored", () => {
  assert.equal(parseProgressLine("[youtube] dQw4w9WgXcQ: Downloading webpage"), null);
  assert.equal(parseProgressLine(""), null);
  assert.equal(parseProgressLine("remora|weird|1|2|3|4|5|x"), null);
  assert.equal(parseProgressLine("remora-pp|weird|Merger"), null);
});
