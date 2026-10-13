/**
 * `npm run remora -- <command> [args]`
 *
 * The maintenance hatch on the side of the machine.
 *   peek <url>              offline: what the glass reads off a pasted URL
 *   info <url>              yt-dlp: what is actually behind the glass
 *   get  <url> [--quality]  the VIDEO slot: drop it, hash it, print the receipt
 *   ls                      the ledger and the scoreboard
 *   verify <file|receipt>   re-hash a vend against its receipt
 *   receipt <file|receipt>  print the receipt again
 *   doctor                  which binaries the machine would use
 *   migrate                 apply src/remora/db/migrations to Neon
 *   enqueue <url> [--quality]  put a coin in the slot (the worker vends it)
 *   jobs                    the queue
 *   machine                 the pulse
 */
import "../../src/remora/env.ts"; // .env.local → process.env, first
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { parseVideoUrl } from "../../src/remora/core/url.ts";
import { prettyBytes, prettyDuration, prettyHeight, prettyPercent, prettySpeed, progressBar } from "../../src/remora/core/pretty.ts";
import type { VideoFormat, VideoMeta } from "../../src/remora/core/meta.ts";
import { isAudio, parseQuality, QUALITIES } from "../../src/remora/core/format.ts";
import { fraction, type PostProcess, type Progress } from "../../src/remora/core/progress.ts";
import { generateReceiptKeys, printReceipt } from "../../src/remora/core/receipt.ts";
import { scoreboard } from "../../src/remora/core/ledger.ts";
import { YtDlpError, ytDlpBin, ytDlpInfo, ytDlpVersion } from "../../src/remora/ytdlp.ts";
import { downloadsDir, ffmpegVersion, ledgerPath, readLedger, vend, VendError, verifyOnDisk } from "../../src/remora/vend.ts";
import { machineLight, pill } from "../../src/remora/core/job.ts";
import { dbWired } from "../../src/remora/db/client.ts";
import { enqueue, freshestMachine, listJobs, liveMachines, migrate } from "../../src/remora/db/queue.ts";
import { machineSummary } from "../../src/remora/core/route.ts";
import { printTape } from "../../src/remora/core/tape.ts";
import { parseClipSpec, prettyClip } from "../../src/remora/core/clip.ts";
import { gifClipReason } from "../../src/remora/core/gif.ts";
import { theTape } from "../../src/remora/tape.ts";
import { shelfWired } from "../../src/remora/storage.ts";

const BANNER = String.raw`
                 ___
   ____  ___  __/ _ \  ___  ____  ___ _      ><(((º>
  / __/ / -_)/ ' ' / \/ _ \/ __/ / _ '/
 /_/    \__//_/_/_/  \___/_/    \_,_/     video vending machine
`;

const [, , command, ...rawArgs] = process.argv;
const { args, flags } = splitFlags(rawArgs);
const BELL = "\u0007";
const TTY = process.stdout.isTTY === true;

async function main(): Promise<number> {
  switch (command) {
    case "peek": {
      const parsed = args[0] ? parseVideoUrl(args[0]) : null;
      if (!parsed) {
        console.error("peek: give me a URL");
        return 2;
      }
      console.log(JSON.stringify(parsed, null, 2));
      return 0;
    }

    case "info": {
      const parsed = args[0] ? parseVideoUrl(args[0]) : null;
      if (!parsed) {
        console.error("info: give me a URL");
        return 2;
      }
      const target = parsed.canonicalUrl || args[0];
      console.log(BANNER);
      process.stdout.write(`  looking through the glass at ${target} ...`);
      const started = Date.now();
      try {
        const meta = await ytDlpInfo(target);
        process.stdout.write(` ${((Date.now() - started) / 1000).toFixed(1)}s\n\n`);
        printMeta(parsed.provider, meta);
        return 0;
      } catch (e) {
        process.stdout.write("\n\n");
        return printError(e);
      }
    }

    case "get": {
      if (!args[0]) {
        console.error("get: give me a URL");
        return 2;
      }
      const quality = parseQuality(flags.quality ?? flags.q);
      if (!quality) {
        console.error(`get: --quality must be one of ${QUALITIES.join(", ")}`);
        return 2;
      }
      const clipSpec = parseClipSpec(flags.clip);
      if (clipSpec && !clipSpec.ok) {
        console.error(`get: --clip ${clipSpec.reason}`);
        return 2;
      }
      const clip = clipSpec?.clip ?? null;
      const gifWhy = quality === "gif" ? gifClipReason(clip) : null;
      if (gifWhy) {
        console.error(`get: ${gifWhy} (--clip 1:23-1:28)`);
        return 2;
      }
      console.log(BANNER);
      console.log(`  slot      ${quality === "gif" ? `GIF ${prettyClip(clip!)}` : quality === "thumbs" ? `THUMBS${clip ? ` ${prettyClip(clip)}` : ""}` : clip ? `CLIP ${prettyClip(clip)}` : isAudio(quality) ? "AUDIO" : "VIDEO"} · ${quality}`);
      const needle = new Needle();
      try {
        const v = await vend({
          input: args[0],
          quality,
          clip,
          dir: flags.dir,
          onStage: (stage, detail) => needle.stage(stage, detail),
          onEstimate: (meta, est) => {
            console.log(`  title     ${meta.title}`);
            console.log(`  by        ${meta.uploader ?? "—"} · ${prettyDuration(meta.duration)}`);
            if (est) {
              console.log(`  expect    ${prettyHeight(est.height)} · ${prettyBytes(est.bytes, est.approx)} · formats ${est.formatIds.join("+")}`);
            }
          },
          onTick: (t) => needle.tick(t),
        });
        needle.done();
        console.log(`\n  CLUNK. ${v.seconds.toFixed(1)}s. dropped at ${v.filepath}\n`);
        for (const line of printReceipt(v.receipt)) {
          console.log(`  ${line}`);
        }
        console.log(`\n  receipt   ${v.receiptPath}`);
        console.log(`  ledger    ${scoreboard(await readLedger())}`);
        if (TTY) process.stdout.write(BELL);
        return 0;
      } catch (e) {
        needle.done();
        console.log("");
        return printError(e);
      }
    }

    case "ls": {
      const rows = await readLedger();
      console.log(BANNER);
      console.log(`  ${scoreboard(rows)}`);
      console.log(`  ${ledgerPath()}\n`);
      for (const r of rows.slice(-20)) {
        console.log(`  ${r.vendedAt.slice(0, 16).replace("T", " ")}  ${r.slot.padEnd(5)} ${r.quality.padEnd(5)} ${prettyBytes(r.bytes).padStart(9)}  ${r.sha256.slice(0, 12)}  ${r.title.slice(0, 48)}`);
      }
      return 0;
    }

    case "verify": {
      if (!args[0]) {
        console.error("verify: give me a file or a receipt");
        return 2;
      }
      try {
        const v = await verifyOnDisk(args[0]);
        if (v.verification.ok) {
          console.log(`  VERIFIED  ${v.receipt.file.name}`);
          console.log(`  sha256    ${v.receipt.file.sha256}`);
          console.log(`  vended    ${v.receipt.receipt.vendedAt} from ${v.receipt.source.canonicalUrl}`);
          return 0;
        }
        console.log(`  DRIFTED   ${v.receipt.file.name}`);
        for (const m of v.verification.mismatches) console.log(`            ${m}`);
        return 1;
      } catch (e) {
        return printError(e);
      }
    }

    case "receipt": {
      if (!args[0]) {
        console.error("receipt: give me a file or a receipt");
        return 2;
      }
      try {
        const v = await verifyOnDisk(args[0]);
        for (const line of printReceipt(v.receipt)) console.log(`  ${line}`);
        console.log(`  ${v.verification.ok ? "bytes on disk still match" : "DRIFTED: " + v.verification.mismatches.join("; ")}`);
        return v.verification.ok ? 0 : 1;
      } catch (e) {
        return printError(e);
      }
    }

    case "migrate": {
      if (!dbWired()) {
        console.error("  no queue: set NEON_DATABASE_URL");
        return 3;
      }
      const dir = fileURLToPath(new URL("../../src/remora/db/migrations/", import.meta.url));
      const names = (await readdir(dir)).filter((n) => n.endsWith(".sql")).sort();
      const files = await Promise.all(names.map(async (name) => ({ name, text: await readFile(join(dir, name), "utf8") })));
      const applied = await migrate(files);
      console.log(applied.length ? `  applied ${applied.join(", ")}` : `  nothing to apply (${names.length} known)`);
      return 0;
    }

    case "enqueue": {
      const parsed = args[0] ? parseVideoUrl(args[0]) : null;
      if (!parsed || !parsed.canonicalUrl) {
        console.error("enqueue: give me a URL");
        return 2;
      }
      const quality = parseQuality(flags.quality ?? flags.q);
      if (!quality) {
        console.error(`enqueue: --quality must be one of ${QUALITIES.join(", ")}`);
        return 2;
      }
      if (!dbWired()) {
        console.error("  no queue: set NEON_DATABASE_URL");
        return 3;
      }
      const clipSpec = parseClipSpec(flags.clip);
      if (clipSpec && !clipSpec.ok) {
        console.error(`enqueue: --clip ${clipSpec.reason}`);
        return 2;
      }
      const gifWhy = quality === "gif" ? gifClipReason(clipSpec?.clip ?? null) : null;
      if (gifWhy) {
        console.error(`enqueue: ${gifWhy} (--clip 1:23-1:28)`);
        return 2;
      }
      const job = await enqueue({ input: args[0], canonicalUrl: parsed.canonicalUrl, provider: parsed.provider, quality, clip: clipSpec?.clip ?? null });
      console.log(`  coin in. ${job.id} · ${job.provider} · ${job.quality}${job.clip ? ` · ${prettyClip(job.clip)}` : ""} · ${pill(job).text}`);
      return 0;
    }

    case "jobs": {
      if (!dbWired()) {
        console.error("  no queue: set NEON_DATABASE_URL");
        return 3;
      }
      const jobs = await listJobs(30);
      console.log(BANNER);
      for (const j of jobs) {
        console.log(`  ${j.createdAt.slice(0, 16).replace("T", " ")}  ${j.id.padEnd(23)} ${pill(j).text.padEnd(16)} ${j.quality.padEnd(5)} ${(j.title ?? j.canonicalUrl).slice(0, 50)}${j.error ? `  ! ${j.error.slice(0, 40)}` : ""}`);
      }
      if (jobs.length === 0) console.log("  no coins yet");
      return 0;
    }

    case "machine": {
      if (!dbWired()) {
        console.error("  no queue: set NEON_DATABASE_URL");
        return 3;
      }
      const now = new Date();
      const [m, live] = await Promise.all([freshestMachine(), liveMachines()]);
      const light = machineLight(m, now);
      console.log(`  ${light.on ? "READY" : "OUT OF ORDER"}  ${light.text}`);
      for (const x of live) {
        console.log(`  ${machineSummary(x, now)} · vends ${x.providers.join(",") || "?"} · yt-dlp ${x.ytDlp ?? "?"} · ffmpeg ${x.ffmpeg ?? "?"} · seen ${x.lastSeen.slice(11, 19)}Z`);
      }
      if (live.length === 0 && m) console.log(`  last seen  ${m.lastSeen} · yt-dlp ${m.ytDlp ?? "?"} · ffmpeg ${m.ffmpeg ?? "?"}`);
      return 0;
    }

    case "tape": {
      const t = await theTape();
      if (!t) {
        console.error("  no queue: set NEON_DATABASE_URL");
        return 3;
      }
      for (const line of printTape(t)) console.log(`  ${line}`);
      return 0;
    }

    case "keygen": {
      // The machine's signing key. Private half to the worker (Fly secret, .env.local),
      // public half to Vercel so /remora/verify can check receipts.
      const k = generateReceiptKeys();
      console.log(`# Remora receipt key · id ${k.keyId} · generated ${new Date().toISOString()}`);
      console.log(`REMORA_RECEIPT_PRIVATE_KEY="${k.privateKeyPem.trim().replace(/\n/g, "\\n")}"`);
      console.log(`REMORA_RECEIPT_PUBLIC_KEY="${k.publicKeyPem.trim().replace(/\n/g, "\\n")}"`);
      return 0;
    }

    case "doctor": {
      console.log(BANNER);
      console.log(`  node       ${process.version}`);
      try {
        console.log(`  yt-dlp     ${await ytDlpVersion()}  (${ytDlpBin()})`);
      } catch (e) {
        console.log(`  yt-dlp     ${e instanceof Error ? e.message : String(e)}`);
      }
      console.log(`  ffmpeg     ${(await ffmpegVersion()) ?? "not found (merges will fail)"}`);
      console.log(`  downloads  ${downloadsDir()}`);
      console.log(`  ledger     ${ledgerPath()}`);
      console.log(`  queue      ${dbWired() ? "NEON_DATABASE_URL set" : "not wired (NEON_DATABASE_URL)"}`);
      console.log(`  shelf      ${shelfWired() ? "REMORA_R2_* set" : "not wired (REMORA_R2_*)"}`);
      return 0;
    }

    case undefined:
    case "help":
      console.log(BANNER);
      console.log("commands:");
      console.log("  peek <url>                what the glass reads off a URL (offline)");
      console.log("  info <url>                what is behind the glass, via yt-dlp");
      console.log("  get  <url> [--quality q] [--clip 1:23-1:45]");
      console.log("                            VIDEO: best|2160|1440|1080|720|480|360 · AUDIO: audio (mp3)|m4a|audio-raw · CLIP: --clip · GIF: gif --clip (≤15s) · THUMBS: thumbs [--clip]");
      console.log("  ls                        the ledger and the scoreboard");
      console.log("  verify <file|receipt>     re-hash a vend against its receipt");
      console.log("  receipt <file|receipt>    print a receipt again");
      console.log("  doctor                    binaries, folders, what is wired");
      console.log("  migrate                   apply db/migrations to Neon");
      console.log("  enqueue <url> [--quality] [--clip]  put a coin in the slot; the worker vends it");
      console.log("  jobs                      the queue");
      console.log("  machine                   the pulse: READY or OUT OF ORDER");
      console.log("  keygen                    a fresh Ed25519 pair for signing receipts (env lines)");
      console.log("  tape                      the open books, as a thermal strip");
      console.log("\nenv: NEON_DATABASE_URL, REMORA_R2_*, REMORA_DOWNLOADS, REMORA_LEDGER, REMORA_YTDLP_BIN, REMORA_FFMPEG_BIN");
      return 0;

    default:
      console.error(`remora: unknown command "${command}" (try: help)`);
      return 2;
  }
}

/** The bar on the front of the machine. Redraws one line on a TTY, logs milestones otherwise. */
class Needle {
  private tick_ = 0;
  private lastFile = "";
  private lastPercent = -1;
  private open = false;

  stage(stage: string, detail: string): void {
    this.close();
    const label = { peek: "reading", info: "looking", drop: "dropping to", tile: "tiling", hash: "hashing", receipt: "printing" }[stage] ?? stage;
    console.log(`  ${label.padEnd(9)} ${detail}`);
  }

  tick(t: Progress | PostProcess): void {
    if (t.kind === "postprocess") {
      this.close();
      if (t.status === "started" && t.processor !== "MoveFiles") {
        const label = { Merger: "merging", ExtractAudio: "extracting", VideoConvertor: "rendering", FFmpegFixupM4a: "fixing" }[t.processor] ?? t.processor.toLowerCase().slice(0, 9);
        console.log(`  ${label.padEnd(9)} ffmpeg at work`);
      }
      return;
    }
    const f = fraction(t);
    const file = t.filename.replace(/^.*\//, "");
    if (file !== this.lastFile) {
      this.close();
      this.lastFile = file;
      this.lastPercent = -1;
      const part = /\.f(\d+)\./.exec(file)?.[1];
      console.log(`  part      ${part ? `format ${part}` : file}${t.total ? ` · ${prettyBytes(t.total, t.approx)}` : ""}`);
    }
    const line = `  ${progressBar(f, 24, this.tick_++)} ${prettyPercent(f)}  ${prettyBytes(t.downloaded).padStart(9)}  ${prettySpeed(t.speed).padStart(10)}  eta ${t.eta === null ? "—" : prettyDuration(t.eta)}`;
    if (TTY) {
      process.stdout.write(`\r${line.padEnd(80)}`);
      this.open = true;
    } else {
      const pct = t.status === "finished" ? 100 : f === null ? -1 : Math.floor(f * 10) * 10;
      if (pct !== this.lastPercent) {
        this.lastPercent = pct;
        console.log(line);
      }
    }
    if (t.status === "finished") this.close();
  }

  done(): void {
    this.close();
  }

  private close(): void {
    if (this.open) {
      process.stdout.write("\n");
      this.open = false;
    }
  }
}

function printMeta(provider: string, m: VideoMeta): void {
  const rows: [string, string][] = [
    ["title", m.title],
    ["by", m.uploader ?? "—"],
    ["length", m.isLive ? "LIVE" : prettyDuration(m.duration)],
    ["uploaded", m.uploadDate ?? "—"],
    ["provider", `${provider} (yt-dlp: ${m.extractor}, id ${m.id})`],
    ["page", m.webpageUrl ?? "—"],
    ["thumb", m.thumbnail ?? "—"],
  ];
  for (const [k, v] of rows) {
    console.log(`  ${k.padEnd(9)} ${v}`);
  }

  const shown = pickFormats(m.formats);
  console.log(`\n  formats   ${m.formats.length} total, ${shown.length} shown\n`);
  console.log(`  ${"id".padEnd(8)} ${"ext".padEnd(5)} ${"size".padStart(10)}  ${"video".padEnd(18)} ${"audio".padEnd(10)} ${"bytes".padStart(10)}`);
  for (const f of shown) {
    const size = f.height === null ? "audio" : `${prettyHeight(f.height)}${f.fps && f.fps > 30 ? `${Math.round(f.fps)}` : ""}`;
    console.log(
      `  ${f.formatId.padEnd(8)} ${f.ext.padEnd(5)} ${size.padStart(10)}  ${(f.vcodec ?? "—").slice(0, 18).padEnd(18)} ${(f.acodec ?? "—").slice(0, 10).padEnd(10)} ${prettyBytes(f.bytes, f.bytesApprox).padStart(10)}`,
    );
  }
}

/** The formats a human wants to see: one per height and container, best bytes first, plus audio-only. */
function pickFormats(formats: VideoFormat[]): VideoFormat[] {
  const byHeight = new Map<string, VideoFormat>();
  for (const f of formats) {
    if (f.vcodec === null && f.acodec === null) continue; // storyboards and the like
    const key = f.height === null ? `audio:${f.ext}` : `${f.height}:${f.ext}`;
    const cur = byHeight.get(key);
    if (!cur || (f.bytes ?? 0) > (cur.bytes ?? 0)) {
      byHeight.set(key, f);
    }
  }
  return [...byHeight.values()].sort((a, b) => (b.height ?? -1) - (a.height ?? -1) || (b.bytes ?? 0) - (a.bytes ?? 0));
}

function printError(e: unknown): number {
  if (e instanceof VendError) {
    console.error(`  nothing dropped: ${e.message}`);
    return 1;
  }
  if (!(e instanceof YtDlpError)) {
    throw e;
  }
  switch (e.kind) {
    case "not-found":
      console.error(`  OUT OF ORDER: ${e.message}. brew install yt-dlp, or set REMORA_YTDLP_BIN.`);
      return 3;
    case "timeout":
      console.error(`  nothing dropped: ${e.message}`);
      return 4;
    case "exit":
      console.error(`  nothing dropped: ${e.message}`);
      return 1;
    case "bad-json":
      console.error(`  the glass fogged up: ${e.message}`);
      return 1;
  }
}

/** `--quality 720`, `--quality=720`, `-q 720`; everything else is a positional. */
function splitFlags(argv: string[]): { args: string[]; flags: Record<string, string> } {
  const args: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--") && a.includes("=")) {
      const [k, ...v] = a.slice(2).split("=");
      flags[k] = v.join("=");
    } else if (a.startsWith("--") || (a.startsWith("-") && a.length === 2)) {
      flags[a.replace(/^-+/, "")] = argv[i + 1] ?? "";
      i++;
    } else {
      args.push(a);
    }
  }
  return { args, flags };
}

process.exitCode = await main();
