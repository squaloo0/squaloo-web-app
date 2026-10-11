import { test } from "node:test";
import assert from "node:assert/strict";
import { ledgerLine, ledgerRow, parseLedgerLine, scoreboard, type LedgerRow } from "./ledger.ts";
import { buildReceipt } from "./receipt.ts";
import { parseYtDlpJson } from "./meta.ts";
import { YTDLP_YOUTUBE_FIXTURE } from "./meta.fixture.ts";

function row(patch: Partial<LedgerRow> = {}): LedgerRow {
  return {
    vendedAt: "2026-10-10T21:04:00.000Z",
    slot: "VIDEO",
    provider: "youtube",
    id: "dQw4w9WgXcQ",
    title: "Rick",
    bytes: 9094158,
    sha256: "a".repeat(64),
    quality: "360",
    file: "Rick [dQw4w9WgXcQ].mp4",
    seconds: 12.3,
    ...patch,
  };
}

test("a receipt becomes a one-line row and comes back", () => {
  const r = buildReceipt({
    input: "x",
    canonicalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    provider: "youtube",
    id: "dQw4w9WgXcQ",
    meta: parseYtDlpJson(YTDLP_YOUTUBE_FIXTURE),
    fileName: "Rick [dQw4w9WgXcQ].mp4",
    bytes: 9094158,
    sha256: "a".repeat(64),
    quality: "360",
    formatIds: [],
    ytDlp: "x",
    ffmpeg: null,
    node: "x",
    now: new Date("2026-10-10T21:04:00.000Z"),
  });
  const line = ledgerLine(ledgerRow(r, 12.34));
  assert.ok(line.endsWith("\n"));
  assert.equal(line.split("\n").length, 2, "one line");
  const back = parseLedgerLine(line)!;
  assert.equal(back.seconds, 12.3);
  assert.equal(back.title, r.video.title);
  assert.equal(back.sha256, r.file.sha256);
});

test("bad lines are skipped, not fatal", () => {
  assert.equal(parseLedgerLine(""), null);
  assert.equal(parseLedgerLine("   "), null);
  assert.equal(parseLedgerLine("{not json"), null);
  assert.equal(parseLedgerLine('{"vendedAt":"x"}'), null);
});

test("the scoreboard", () => {
  assert.equal(scoreboard([]), "0 vends · the machine is waiting");
  assert.equal(scoreboard([row()]), "1 vend · 8.7 MB · 1 provider · 12s of machine time · last 2026-10-10 21:04 UTC");
  const two = scoreboard([row(), row({ provider: "vimeo", bytes: 1024 * 1024, vendedAt: "2026-10-11T01:00:00.000Z", seconds: 8 })]);
  assert.equal(two, "2 vends · 9.7 MB · 2 providers · 20s of machine time · last 2026-10-11 01:00 UTC");
});
