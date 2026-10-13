/**
 * One vend, end to end, on this machine: URL → info → drop → hash → receipt → ledger.
 *
 * I/O edge. Everything it decides, it decides through core/*; everything it touches
 * (yt-dlp, ffmpeg, the disk) goes through here. Phase 3 lifts this loop into the worker.
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { appendFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { parseVideoUrl } from "./core/url.ts";
import { estimate, isMetadataOnly, type Estimate, type Quality } from "./core/format.ts";
import { chaptersFileName, chaptersMarkdown, chaptersSummary } from "./core/chapters.ts";
import type { Clip } from "./core/clip.ts";
import type { VideoMeta } from "./core/meta.ts";
import type { PostProcess, Progress } from "./core/progress.ts";
import { buildReceipt, parseReceipt, pemFromEnv, receiptFileName, receiptText, signReceipt, verifyReceipt, type Receipt, type Verification } from "./core/receipt.ts";
import { ledgerLine, ledgerRow, parseLedgerLine, type LedgerRow } from "./core/ledger.ts";
import { ytDlpDownload, ytDlpInfo, ytDlpVersion } from "./ytdlp.ts";
import { ffmpeg as runFfmpeg } from "./ffmpeg.ts";
import { thumbsFileName, thumbsPlan } from "./core/thumbs.ts";
import { transcriptFileName, transcriptMarkdown } from "./core/transcript.ts";
import { transcribe, whisperModelName, whisperWired } from "./whisper.ts";

export class VendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VendError";
  }
}

export type Stage = "peek" | "info" | "drop" | "tile" | "listen" | "hash" | "receipt";

export type VendOptions = {
  input: string;
  quality: Quality;
  /** The CLIP slot: a range, or null for the whole thing. */
  clip?: Clip | null;
  /** Defaults to downloadsDir(). */
  dir?: string;
  /** The punch card that paid (public handle), for the receipt. */
  card?: string | null;
  /** Which machine is vending, for the receipt. */
  machine?: string;
  /** Ed25519 private key PEM; defaults to REMORA_RECEIPT_PRIVATE_KEY. Unsigned when absent. */
  signingKey?: string | null;
  onStage?: (stage: Stage, detail: string) => void;
  onEstimate?: (meta: VideoMeta, estimate: Estimate | null) => void;
  onTick?: (tick: Progress | PostProcess) => void;
};

export type Vend = {
  receipt: Receipt;
  filepath: string;
  receiptPath: string;
  seconds: number;
};

/** ~/.remora/downloads unless REMORA_DOWNLOADS says otherwise. Always absolute. */
export function downloadsDir(): string {
  return resolve(process.env.REMORA_DOWNLOADS || join(homedir(), ".remora", "downloads"));
}

export function ledgerPath(): string {
  return resolve(process.env.REMORA_LEDGER || join(homedir(), ".remora", "ledger.jsonl"));
}

export async function vend(opts: VendOptions): Promise<Vend> {
  const started = Date.now();
  const dir = resolve(opts.dir ?? downloadsDir());

  opts.onStage?.("peek", opts.input);
  const parsed = parseVideoUrl(opts.input);
  if (!parsed) {
    throw new VendError("that is not a URL");
  }
  const target = parsed.canonicalUrl || opts.input;

  opts.onStage?.("info", target);
  const meta = await ytDlpInfo(target);
  if (meta.isLive) {
    throw new VendError("that is a live stream; the machine vends files");
  }
  const est = estimate(meta, opts.quality);
  opts.onEstimate?.(meta, est);

  await mkdir(dir, { recursive: true });
  const used = new Set<string>();
  let filepath: string;
  let chapters: { count: number; first: string | null; last: string | null } | null = null;

  if (isMetadataOnly(opts.quality)) {
    // The CHAPTERS slot: nothing is fetched; the drop is written from what yt-dlp already read.
    if (meta.chapters.length === 0) {
      throw new VendError("this video has no chapters (none from the uploader, none in the description)");
    }
    opts.onStage?.("drop", `${meta.chapters.length} chapters, no download`);
    filepath = join(dir, chaptersFileName(meta.title, meta.id));
    await writeFile(filepath, chaptersMarkdown({ meta, canonicalUrl: parsed.canonicalUrl, provider: parsed.provider, now: new Date() }), "utf8");
    chapters = chaptersSummary(meta.chapters);
  } else {
    opts.onStage?.("drop", dir);
    // yt-dlp names each part "<title> [id].f<format>.<ext>" while it is in flight, so the
    // ticks tell us which formats actually went into the file. The estimate is a guess.
    const dropped = await ytDlpDownload(target, {
    dir,
    quality: opts.quality,
    clip: opts.clip ?? null,
    onTick: (t) => {
      if (t.kind === "download") {
        const m = /\.f([A-Za-z0-9_-]+)\.[^./]+$/.exec(t.filename);
        if (m) used.add(m[1]);
      }
      opts.onTick?.(t);
    },
  });
    filepath = dropped.filepath;
  }

  let transcript: { model: string; language: string | null; segments: number; whisper: string | null } | null = null;
  if (opts.quality === "transcript") {
    // The TRANSCRIPT slot: whisper listens to the WAV, Remora writes the document, the WAV goes.
    const wired = await whisperWired();
    if (!wired.ok) throw new VendError(`this machine cannot transcribe: ${wired.reason}`);
    opts.onStage?.("listen", `${whisperModelName()} · ${meta.duration ? prettyDurationSafe(opts.clip ? opts.clip.end - opts.clip.start : meta.duration) : "unknown length"}`);
    const outBase = filepath.replace(/\.[^./]+$/, "") + ".whisper";
    const result = await transcribe(filepath, outBase);
    const doc = join(dirname(filepath), transcriptFileName(basename(filepath)));
    await writeFile(
      doc,
      transcriptMarkdown({ meta, canonicalUrl: parsed.canonicalUrl, clip: opts.clip ?? null, result, model: whisperModelName(), whisperVersion: wired.version, now: new Date() }),
      "utf8",
    );
    await rm(filepath, { force: true });
    await rm(`${outBase}.json`, { force: true });
    transcript = { model: whisperModelName(), language: result.language, segments: result.segments.length, whisper: wired.version };
    filepath = doc;
  }

  if (opts.quality === "thumbs") {
    // The THUMBS slot: tile twelve frames of what dropped into one sheet, then drop the video.
    const span = opts.clip ? opts.clip.end - opts.clip.start : meta.duration;
    const sheet = join(dirname(filepath), thumbsFileName(basename(filepath)));
    const plan = span === null ? null : thumbsPlan(filepath, sheet, span);
    if (!plan) {
      throw new VendError("thumbs need a video at least a second long with a known length");
    }
    opts.onStage?.("tile", `${Math.round(plan.step * 10) / 10}s apart`);
    await runFfmpeg(plan.args);
    await rm(filepath, { force: true });
    filepath = sheet;
  }

  opts.onStage?.("hash", filepath);
  const [sha256, size, ytDlp, ffmpeg] = await Promise.all([sha256File(filepath), stat(filepath), ytDlpVersion(), ffmpegVersion()]);

  opts.onStage?.("receipt", receiptFileName(basename(filepath)));
  const unsigned = buildReceipt({
    input: opts.input,
    canonicalUrl: parsed.canonicalUrl,
    provider: parsed.provider,
    id: parsed.id,
    meta,
    fileName: basename(filepath),
    bytes: size.size,
    sha256,
    quality: opts.quality,
    formatIds: used.size > 0 ? [...used] : (est?.formatIds ?? []),
    ytDlp,
    ffmpeg,
    node: process.version,
    machine: opts.machine,
    card: opts.card ?? null,
    clip: opts.clip ?? null,
    transcript,
    chapters,
    now: new Date(),
  });
  const key = opts.signingKey === undefined ? pemFromEnv(process.env.REMORA_RECEIPT_PRIVATE_KEY) : opts.signingKey;
  const receipt = key ? signReceipt(unsigned, key) : unsigned;
  const receiptPath = join(dirname(filepath), receiptFileName(basename(filepath)));
  await writeFile(receiptPath, receiptText(receipt), "utf8");

  const seconds = (Date.now() - started) / 1000;
  await appendLedger(ledgerRow(receipt, seconds));

  return { receipt, filepath, receiptPath, seconds };
}

/** SHA-256 of a file, streamed, hex. */
export function sha256File(path: string): Promise<string> {
  return new Promise((res, rej) => {
    const h = createHash("sha256");
    createReadStream(path)
      .on("data", (chunk) => h.update(chunk))
      .on("error", rej)
      .on("end", () => res(h.digest("hex")));
  });
}

/** "9.0.2" from `ffmpeg -version`, or null when there is no ffmpeg. */
export function ffmpegVersion(): Promise<string | null> {
  return new Promise((res) => {
    const child = spawn(process.env.REMORA_FFMPEG_BIN || "ffmpeg", ["-version"], { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    child.stdout.on("data", (b: Buffer) => (out += b.toString("utf8")));
    child.on("error", () => res(null));
    child.on("close", (code) => {
      const m = /^ffmpeg version (\S+)/.exec(out);
      res(code === 0 && m ? m[1] : null);
    });
  });
}

export async function appendLedger(row: LedgerRow): Promise<void> {
  const path = ledgerPath();
  await mkdir(dirname(path), { recursive: true });
  await appendFile(path, ledgerLine(row), "utf8");
}

export async function readLedger(): Promise<LedgerRow[]> {
  let text: string;
  try {
    text = await readFile(ledgerPath(), "utf8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
  return text.split("\n").map(parseLedgerLine).filter((r): r is LedgerRow => r !== null);
}

export type Verified = { receipt: Receipt; receiptPath: string; filepath: string; verification: Verification };

/** Re-hash the file a receipt points at and compare. `path` may be the receipt or the file. */
export async function verifyOnDisk(path: string): Promise<Verified> {
  const abs = resolve(path);
  const receiptPath = abs.endsWith(".receipt.json") ? abs : join(dirname(abs), receiptFileName(basename(abs)));
  let text: string;
  try {
    text = await readFile(receiptPath, "utf8");
  } catch {
    throw new VendError(`no receipt at ${receiptPath}`);
  }
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new VendError(`${basename(receiptPath)} is not JSON`);
  }
  const receipt = parseReceipt(json);
  if (!receipt) {
    throw new VendError(`${basename(receiptPath)} is not a Remora receipt`);
  }
  const filepath = join(dirname(receiptPath), receipt.file.name);
  let size: number;
  try {
    size = (await stat(filepath)).size;
  } catch {
    return { receipt, receiptPath, filepath, verification: { ok: false, mismatches: [`file missing: ${receipt.file.name}`] } };
  }
  const sha256 = await sha256File(filepath);
  return { receipt, receiptPath, filepath, verification: verifyReceipt(receipt, { bytes: size, sha256 }) };
}

function prettyDurationSafe(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}
