/**
 * The receipt. The file is the by-product; this is the product.
 *
 * What it was, where it came from, when, the SHA-256 of the bytes on disk, which
 * tools did it, and Remora's Ed25519 signature over all of that, so anyone with the
 * public key can check it at /remora/verify. Pure; keys are inputs.
 */
import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify, type KeyObject } from "node:crypto";
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
    /** Which machine vended. */
    machine?: string;
  };
  /** The public handle of the punch card that paid, or null for a keyed vend. */
  card: string | null;
  /** Ed25519 over receiptBytes(); null until the machine has a key. */
  signature: Signature | null;
};

export type Signature = {
  alg: "ed25519";
  /** First 12 hex of SHA-256 of the public key's DER: which key signed. */
  keyId: string;
  /** base64 of the 64-byte signature. */
  sig: string;
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
  machine?: string;
  card?: string | null;
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
    tools: { ytDlp: i.ytDlp, ffmpeg: i.ffmpeg, node: i.node, ...(i.machine ? { machine: i.machine } : {}) },
    card: i.card ?? null,
    signature: null,
  };
}

/** The bytes under the signature: the receipt with `signature` null, in receiptText() form. */
export function receiptBytes(r: Receipt): string {
  return receiptText({ ...r, signature: null });
}

export function keyIdOf(publicKey: KeyObject): string {
  return createHash("sha256").update(publicKey.export({ type: "spki", format: "der" })).digest("hex").slice(0, 12);
}

/** Sign with an Ed25519 private key (PEM, PKCS#8). Returns a new receipt. */
export function signReceipt(r: Receipt, privateKeyPem: string): Receipt {
  const priv = createPrivateKey(privateKeyPem);
  const pub = createPublicKey(priv);
  const sig = sign(null, Buffer.from(receiptBytes(r), "utf8"), priv).toString("base64");
  return { ...r, signature: { alg: "ed25519", keyId: keyIdOf(pub), sig } };
}

export type SignatureCheck = { ok: true; keyId: string } | { ok: false; reason: string };

/** Does this receipt carry a valid signature from this public key (PEM, SPKI)? */
export function checkSignature(r: Receipt, publicKeyPem: string): SignatureCheck {
  if (r.signature === null) return { ok: false, reason: "unsigned" };
  if (r.signature.alg !== "ed25519") return { ok: false, reason: `unknown algorithm ${String(r.signature.alg)}` };
  let pub: KeyObject;
  try {
    pub = createPublicKey(publicKeyPem);
  } catch {
    return { ok: false, reason: "bad public key" };
  }
  const keyId = keyIdOf(pub);
  if (r.signature.keyId !== keyId) return { ok: false, reason: `signed by ${r.signature.keyId}, this key is ${keyId}` };
  let good = false;
  try {
    good = verify(null, Buffer.from(receiptBytes(r), "utf8"), pub, Buffer.from(r.signature.sig, "base64"));
  } catch {
    good = false;
  }
  return good ? { ok: true, keyId } : { ok: false, reason: "signature does not match these bytes" };
}

/** A fresh Ed25519 pair as PEM, for `remora keygen`. */
export function generateReceiptKeys(): { privateKeyPem: string; publicKeyPem: string; keyId: string } {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  return {
    privateKeyPem: privateKey.export({ type: "pkcs8", format: "pem" }) as string,
    publicKeyPem: publicKey.export({ type: "spki", format: "pem" }) as string,
    keyId: keyIdOf(publicKey),
  };
}

/**
 * Env files flatten PEMs onto one line with literal \n; put the newlines back. Dashboards
 * store a pasted value literally, so surrounding quotes are forgiven too.
 */
export function pemFromEnv(v: string | undefined): string | null {
  if (!v) return null;
  const t = v.trim();
  const quoted = (t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"));
  const s = quoted ? t.slice(1, -1) : v;
  return s.includes("\\n") ? s.replace(/\\n/g, "\n") : s;
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
  if (r.signature !== null && r.signature !== undefined && (typeof r.signature !== "object" || typeof r.signature.sig !== "string" || typeof r.signature.keyId !== "string")) return null;
  return { ...r, card: r.card ?? null, signature: r.signature ?? null };
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
  // Soft-wrap on spaces, hard-break anything wider than the paper (URLs, file names).
  const wrap = (s: string, width = W): string[] => {
    const lines: string[] = [];
    let cur = "";
    for (const word of s.split(" ")) {
      for (const piece of chunk(word, width)) {
        if (cur.length === 0) cur = piece;
        else if (cur.length + 1 + piece.length <= width) cur += " " + piece;
        else {
          lines.push(cur);
          cur = piece;
        }
      }
    }
    if (cur.length > 0) lines.push(cur);
    return lines;
  };
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
    "url",
    ...wrap(r.source.canonicalUrl),
    "",
    "file",
    ...wrap(r.file.name),
    kv("size", `${prettyBytes(r.file.bytes)} (${r.file.bytes} B)`),
    kv("quality", r.file.quality),
    "sha256",
    r.file.sha256.slice(0, 32),
    r.file.sha256.slice(32),
    "",
    kv("yt-dlp", r.tools.ytDlp),
    kv("ffmpeg", r.tools.ffmpeg ?? "—"),
    kv("node", r.tools.node),
    ...(r.tools.machine ? [kv("machine", r.tools.machine)] : []),
    kv("card", r.card ?? "service key"),
    rule,
    center(r.signature === null ? "unsigned" : `signed · ed25519 · ${r.signature.keyId}`),
    center("thank you, come again"),
    rule,
  ];
}

function chunk(s: string, width: number): string[] {
  if (s.length <= width) return [s];
  const out: string[] = [];
  for (let i = 0; i < s.length; i += width) out.push(s.slice(i, i + width));
  return out;
}
