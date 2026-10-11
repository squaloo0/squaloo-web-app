/**
 * The machine. Claims a job from Neon, vends it on this box, puts the file and its
 * receipt on the shelf (R2), and tells the queue. Heartbeats while it works so a dead
 * worker's job goes back on the shelf, and ticks a pulse row so the panel can say
 * READY or OUT OF ORDER truthfully.
 *
 *   npm run remora:worker        locally, against a Neon branch
 *   fly deploy (workers/remora)  the always-on box
 *
 * Env: NEON_DATABASE_URL, the REMORA_R2_* set, REMORA_MACHINE_NAME (default hostname),
 * REMORA_TICK_MS (idle poll, default 5000), REMORA_TTL_DAYS (shelf life, default 7).
 */
import { mkdtemp, rm } from "node:fs/promises";
import { hostname, tmpdir } from "node:os";
import { basename, join } from "node:path";
import type { Job } from "../../src/remora/core/job.ts";
import { fraction } from "../../src/remora/core/progress.ts";
import { dbWired } from "../../src/remora/db/client.ts";
import { addAsset, beat, claimNextJob, complete, expiredAssets, fail, heartbeat, markDeleted, recoverStale } from "../../src/remora/db/queue.ts";
import { contentTypeFor, deleteObject, putFile, shelfWired } from "../../src/remora/storage.ts";
import { ffmpegVersion, vend } from "../../src/remora/vend.ts";
import { ytDlpVersion } from "../../src/remora/ytdlp.ts";

const NAME = process.env.REMORA_MACHINE_NAME || hostname();
const TICK_MS = Number(process.env.REMORA_TICK_MS ?? 5000);
const TTL_DAYS = Number(process.env.REMORA_TTL_DAYS ?? 7);
const HEARTBEAT_MS = 15_000;

const log = (msg: string) => console.log(`${new Date().toISOString()} ${NAME}: ${msg}`);

let running = true;
for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    log(`${sig}, finishing the current vend`);
    running = false;
  });
}

async function main(): Promise<void> {
  if (!dbWired()) throw new Error("NEON_DATABASE_URL is not set; the machine has no queue");
  if (!shelfWired()) throw new Error("the shelf is not wired; set the REMORA_R2_* variables");

  const tools = { name: NAME, ytDlp: await ytDlpVersion().catch(() => null), ffmpeg: await ffmpegVersion() };
  log(`plugged in · yt-dlp ${tools.ytDlp ?? "missing"} · ffmpeg ${tools.ffmpeg ?? "missing"} · tick ${TICK_MS}ms · ttl ${TTL_DAYS}d`);
  await beat(tools);

  while (running) {
    const recovered = await recoverStale();
    if (recovered > 0) log(`put ${recovered} stale job(s) back on the shelf`);

    const job = await claimNextJob(NAME);
    if (job) {
      await process_(job, tools);
      continue; // straight to the next coin
    }

    await sweep();
    await beat(tools);
    await sleep(TICK_MS);
  }
  log("unplugged");
}

async function process_(job: Job, tools: { name: string; ytDlp: string | null; ffmpeg: string | null }): Promise<void> {
  log(`claimed ${job.id} · ${job.provider} · ${job.quality} · attempt ${job.attempts}`);
  const dir = await mkdtemp(join(tmpdir(), "remora-"));
  let lastBeat = Date.now();
  let title: string | null = null;
  let ours = true;

  const pulse = async (progress: number | null) => {
    ours = await heartbeat(job.id, NAME, progress, title);
    lastBeat = Date.now();
    if (!ours) log(`${job.id} is no longer ours (recovered by someone else?); finishing anyway`);
  };

  try {
    const v = await vend({
      input: job.input,
      quality: job.quality,
      dir,
      onEstimate: (meta) => {
        title = meta.title;
        void pulse(0);
      },
      onTick: (t) => {
        if (t.kind !== "download" || Date.now() - lastBeat < HEARTBEAT_MS) return;
        void pulse(fraction(t));
      },
    });

    const expiresAt = new Date(Date.now() + TTL_DAYS * 86_400_000).toISOString();
    const fileName = basename(v.filepath);
    const receiptName = basename(v.receiptPath);
    const prefix = `vends/${job.id}`;

    await pulse(0.99);
    await putFile(`${prefix}/${fileName}`, v.filepath, contentTypeFor(fileName));
    await putFile(`${prefix}/${receiptName}`, v.receiptPath, "application/json");

    await addAsset({
      jobId: job.id,
      kind: job.quality === "audio" ? "audio" : "video",
      objectKey: `${prefix}/${fileName}`,
      fileName,
      bytes: v.receipt.file.bytes,
      sha256: v.receipt.file.sha256,
      contentType: contentTypeFor(fileName),
      expiresAt,
    });
    await addAsset({
      jobId: job.id,
      kind: "receipt",
      objectKey: `${prefix}/${receiptName}`,
      fileName: receiptName,
      bytes: Buffer.byteLength(JSON.stringify(v.receipt, null, 2) + "\n"),
      sha256: "",
      contentType: "application/json",
      expiresAt,
    });

    await complete(job.id, NAME, v.receipt.video.title);
    await beat(tools, 1);
    log(`CLUNK ${job.id} · ${fileName} · ${v.receipt.file.bytes} B · ${v.seconds.toFixed(1)}s`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log(`nothing dropped for ${job.id}: ${message}`);
    await fail(job.id, NAME, message.slice(0, 500));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** Objects past their shelf life: delete from R2, mark the row. A few per idle tick. */
async function sweep(): Promise<void> {
  const expired = await expiredAssets(5);
  for (const a of expired) {
    try {
      await deleteObject(a.objectKey);
      await markDeleted(a.id);
      log(`swept ${a.objectKey}`);
    } catch (e) {
      log(`sweep failed for ${a.objectKey}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

await main();
