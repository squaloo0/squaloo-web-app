import { test } from "node:test";
import assert from "node:assert/strict";
import { buildReceipt, checkSignature, generateReceiptKeys, parseReceipt, pemFromEnv, printReceipt, receiptFileName, receiptText, signReceipt, verifyReceipt, type ReceiptInput } from "./receipt.ts";
import { parseYtDlpJson } from "./meta.ts";
import { YTDLP_YOUTUBE_FIXTURE } from "./meta.fixture.ts";

const SHA = "a".repeat(64);

function input(patch: Partial<ReceiptInput> = {}): ReceiptInput {
  return {
    input: "https://youtu.be/dQw4w9WgXcQ?si=x",
    canonicalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    provider: "youtube",
    id: "dQw4w9WgXcQ",
    meta: parseYtDlpJson(YTDLP_YOUTUBE_FIXTURE),
    fileName: "Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster) [dQw4w9WgXcQ].mp4",
    bytes: 9094158,
    sha256: SHA,
    quality: "360",
    formatIds: ["396", "251"],
    ytDlp: "2026.08.19",
    ffmpeg: "9.0.2",
    node: "v22.22.1",
    now: new Date("2026-10-10T21:04:00.000Z"),
    ...patch,
  };
}

test("a receipt says what it was, where from, when, and the hash", () => {
  const r = buildReceipt(input());
  assert.equal(r.receipt.version, 1);
  assert.equal(r.receipt.slot, "VIDEO");
  assert.equal(r.receipt.vendedAt, "2026-10-10T21:04:00.000Z");
  assert.equal(r.source.input, "https://youtu.be/dQw4w9WgXcQ?si=x");
  assert.equal(r.source.extractor, "youtube");
  assert.equal(r.video.title, "Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)");
  assert.equal(r.video.uploadDate, "2009-10-25");
  assert.equal(r.file.sha256, SHA);
  assert.equal(r.signature, null);
  assert.equal(buildReceipt(input({ quality: "audio" })).receipt.slot, "AUDIO");
});

test("the text is stable and round-trips through parseReceipt", () => {
  const r = buildReceipt(input());
  const text = receiptText(r);
  assert.equal(text, receiptText(r), "deterministic");
  assert.ok(text.endsWith("}\n"));
  assert.deepEqual(parseReceipt(JSON.parse(text)), r);
});

test("parseReceipt refuses things that are not our receipts", () => {
  assert.equal(parseReceipt(null), null);
  assert.equal(parseReceipt({}), null);
  assert.equal(parseReceipt({ receipt: { version: 2, machine: "remora" } }), null);
  const r = JSON.parse(receiptText(buildReceipt(input())));
  r.file.sha256 = "not hex";
  assert.equal(parseReceipt(r), null);
});

test("receipt file name sits next to the file", () => {
  assert.equal(receiptFileName("a [id].mp4"), "a [id].receipt.json");
  assert.equal(receiptFileName("noext"), "noext.receipt.json");
  assert.equal(receiptFileName("v1.2 [id].webm"), "v1.2 [id].receipt.json");
});

test("verify: same bytes, same hash, ok; otherwise it names what moved", () => {
  const r = buildReceipt(input());
  assert.deepEqual(verifyReceipt(r, { bytes: 9094158, sha256: SHA.toUpperCase() }), { ok: true, mismatches: [] });
  const v = verifyReceipt(r, { bytes: 1, sha256: "b".repeat(64) });
  assert.equal(v.ok, false);
  assert.equal(v.mismatches.length, 2);
  assert.match(v.mismatches[0], /^bytes:/);
  assert.match(v.mismatches[1], /^sha256:/);
});

test("the printed receipt is 40 columns of thermal paper", () => {
  const lines = printReceipt(buildReceipt(input()));
  for (const l of lines) {
    assert.ok(l.length <= 40, `too wide: ${JSON.stringify(l)}`);
  }
  assert.ok(lines.some((l) => l.includes("R E M O R A")));
  assert.ok(lines.some((l) => l.startsWith("sha256")));
  assert.ok(lines.includes(SHA.slice(0, 32)));
  assert.ok(lines.some((l) => l.includes("unsigned")));
  assert.ok(lines.some((l) => l.includes("Rick Astley")));
  // nothing is truncated: the URL and the file name come back whole when the paper is re-joined
  const i = lines.indexOf("url");
  assert.equal(lines.slice(i + 1, i + 3).join(""), "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const f = lines.indexOf("file");
  const name = "Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster) [dQw4w9WgXcQ].mp4";
  assert.equal(lines.slice(f + 1, f + 4).join(" ").replace(/  +/g, " ").trim(), name);
});

test("a 200-character token hard-breaks instead of vanishing", () => {
  const long = "x".repeat(200);
  const lines = printReceipt(buildReceipt(input({ canonicalUrl: `https://e.com/${long}` })));
  const i = lines.indexOf("url");
  assert.equal(lines.slice(i + 1, i + 7).join(""), `https://e.com/${long}`);
});

test("a signed receipt checks out, and any changed byte does not", () => {
  const keys = generateReceiptKeys();
  const other = generateReceiptKeys();
  const r = signReceipt(buildReceipt(input({ card: "card_abcdef123456", machine: "fly-sjc" })), keys.privateKeyPem);
  assert.equal(r.signature?.alg, "ed25519");
  assert.equal(r.signature?.keyId, keys.keyId);
  assert.deepEqual(checkSignature(r, keys.publicKeyPem), { ok: true, keyId: keys.keyId });

  const tampered = { ...r, file: { ...r.file, sha256: "b".repeat(64) } };
  assert.equal(checkSignature(tampered, keys.publicKeyPem).ok, false);
  assert.match((checkSignature(r, other.publicKeyPem) as { reason: string }).reason, /signed by/);
  assert.equal(checkSignature({ ...r, signature: null }, keys.publicKeyPem).ok, false);
  assert.equal(checkSignature(r, "not a pem").ok, false);

  // survives the trip to disk and back
  const back = parseReceipt(JSON.parse(receiptText(r)))!;
  assert.deepEqual(checkSignature(back, keys.publicKeyPem), { ok: true, keyId: keys.keyId });
  const lines = printReceipt(back);
  assert.ok(lines.some((l) => l.includes(`signed · ed25519 · ${keys.keyId}`)));
  assert.ok(lines.some((l) => l.startsWith("card      card_abcdef123456")));
  assert.ok(lines.some((l) => l.startsWith("machine   fly-sjc")));
});

test("PEMs flattened into an env file come back with their newlines", () => {
  const { privateKeyPem } = generateReceiptKeys();
  const flat = privateKeyPem.replace(/\n/g, "\\n");
  assert.equal(pemFromEnv(flat), privateKeyPem);
  assert.equal(pemFromEnv(privateKeyPem), privateKeyPem);
  assert.equal(pemFromEnv(undefined), null);
});
