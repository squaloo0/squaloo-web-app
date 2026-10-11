/**
 * The receipt. The file is the by-product; this is the product.
 *
 * What it was, where it came from, when, the SHA-256 of the bytes on disk, and which
 * tools did it. Unsigned until Phase 4 wires Remora's Ed25519 key; the `signature`
 * field is already there so the shape does not change under anyone. Pure.
 */
import type { Provider } from "./url.ts";
import type { VideoMeta } from "./meta.ts";
import type { Quality } from "./format.ts";
import { prettyBytes, prettyDuration } from "./pretty.ts";

export const RECEIPT_VERSION = 1 as const;

export type Receipt = {
  receipt: {
    version: typeof RECEIPT_VERSION;
    kind: "vend";
    slot: "VIDEO" | "AUDIO";
    /** ISO-8601, UTC. */
    vendedAt: string;
    machine: "remora";
  };
  source: {
    /** Exactly what was pasted. */
    input: string;
    canonicalUrl: string;
    provider: Provider;
    id: string | null;
    /** yt-dlp's extractor name. */
    extractor: string;
  };
  video: {
    title: string;
    uploader: string | null;
    uploadDate: string | null;
    duration: number | null;
    webpageUrl: string | null;
  };
  file: {
    /** Basename only. The receipt sits next to it. */
    name: string;
    bytes: number;
    /** Hex, lower case, of the bytes on disk. */
    sha256: string;
    quality: Quality;
    /** yt-dlp format ids that were merged into the file, when known. */
    formatIds: string[];
  };
  tools: {
    ytDlp: string;
    ffmpeg: string | null;
    node: string;
  };
  /** Phase 4: Ed25519 over receiptText() with this field null. */
  signature: null;
};

export type ReceiptInput = {
  input: string;
  canonicalUrl: string;
  provider: Provider;
  id: string | null;
  meta: VideoMeta;
  fileName: string;
  bytes: number;
  sha256: string;
  quality: Quality;
  formatIds: string[];
  ytDlp: string;
  ffmpeg: string | null;
  node: string;
  /** Injected so the builder stays pure and the tests stay still. */
  now: Date;
};

export function buildReceipt(i: ReceiptInput): Receipt {
  return {
    receipt: { version: RECEIPT_VERSION, kind: "vend", slot: i.quality === "audio" ? "AUDIO" : "VIDEO", vendedAt: i.now.toISOString(), machine: "remora" },
    source: { input: i.input, canonicalUrl: i.canonicalUrl, provider: i.provider, id: i.id, extractor: i.meta.extractor },
    video: {
      title: i.meta.title,
      uploader: i.meta.uploader,
      uploadDate: i.meta.uploadDate,
      duration: i.meta.duration,
      webpageUrl: i.meta.webpageUrl,
    },
    file: { name: i.fileName, bytes: i.bytes, sha256: i.sha256, quality: i.quality, formatIds: i.formatIds },
    tools: { ytDlp: i.ytDlp, ffmpeg: i.ffmpeg, node: i.node },
    signature: null,
  };
}

/** The bytes that go on disk and, in Phase 4, under the signature. Stable key order. */
export function receiptText(r: Receipt): string {
  return JSON.stringify(r, null, 2) + "\n";
}

/** "Rick [dQw4w9WgXcQ].mp4" → "Rick [dQw4w9WgXcQ].receipt.json" */
export function receiptFileName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  const stem = dot > 0 ? fileName.slice(0, dot) : fileName;
  return `${stem}.receipt.json`;
}

/** Narrow a receipt read back from disk. Null when it is not one of ours. */
export function parseReceipt(json: unknown): Receipt | null {
  if (typeof json !== "object" || json === null) return null;
  const r = json as Receipt;
  if (r.receipt?.version !== RECEIPT_VERSION || r.receipt.machine !== "remora") return null;
  if (typeof r.file?.name !== "string" || typeof r.file.bytes !== "number" || !/^[0-9a-f]{64}$/.test(r.file.sha256 ?? "")) return null;
  if (typeof r.video?.title !== "string" || typeof r.source?.canonicalUrl !== "string") return null;
  return r;
}

export type Verification = { ok: boolean; mismatches: string[] };

/** Does what is on disk still match what the receipt says? */
export function verifyReceipt(r: Receipt, observed: { bytes: number; sha256: string }): Verification {
  const mismatches: string[] = [];
  if (observed.bytes !== r.file.bytes) mismatches.push(`bytes: receipt ${r.file.bytes}, disk ${observed.bytes}`);
  if (observed.sha256.toLowerCase() !== r.file.sha256) mismatches.push(`sha256: receipt ${r.file.sha256.slice(0, 16)}…, disk ${observed.sha256.slice(0, 16)}…`);
  return { ok: mismatches.length === 0, mismatches };
}

/** The thermal-printer rendering. 40 columns, because that is what the paper is. */
export function printReceipt(r: Receipt): string[] {
  const W = 40;
  const rule = "-".repeat(W);
  const center = (s: string) => s.padStart(Math.floor((W + s.length) / 2)).padEnd(W);
  const kv = (k: string, v: string) => `${k.padEnd(10)}${v.slice(0, W - 10)}`;
  const wrap = (s: string) =>
    s
      .split(" ")
      .reduce<string[]>((lines, w) => {
        const last = lines[lines.length - 1];
        if (last !== undefined && (last + " " + w).length <= W) lines[lines.length - 1] = last + " " + w;
        else lines.push(w.slice(0, W));
        return lines;
      }, [])
      .filter((l) => l.length > 0);
  const date = r.receipt.vendedAt.replace("T", " ").slice(0, 19) + " UTC";
  return [
    rule,
    center("R E M O R A"),
    center("video vending machine"),
    center("not a downloader"),
    rule,
    kv("slot", r.receipt.slot),
    kv("vended", date),
    "",
    ...wrap(r.video.title),
    kv("by", r.video.uploader ?? "—"),
    kv("length", prettyDuration(r.video.duration)),
    kv("uploaded", r.video.uploadDate ?? "—"),
    kv("from", `${r.source.provider}${r.source.id ? ` ${r.source.id}` : ""}`),
    ...wrap(r.source.canonicalUrl).map((l, i) => (i === 0 ? kv("url", l) : " ".repeat(10) + l)),
    "",
    kv("file", r.file.name.slice(0, W - 10)),
    kv("size", `${prettyBytes(r.file.bytes)} (${r.file.bytes} B)`),
    kv("quality", r.file.quality),
    "sha256",
    r.file.sha256.slice(0, 32),
    r.file.sha256.slice(32),
    "",
    kv("yt-dlp", r.tools.ytDlp),
    kv("ffmpeg", r.tools.ffmpeg ?? "—"),
    kv("node", r.tools.node),
    rule,
    center(r.signature === null ? "unsigned · phase 4" : "signed"),
    center("thank you, come again"),
    rule,
  ];
}
