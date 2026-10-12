/**
 * The machine. Claims a job from Neon, vends it on this box, puts the file and its
 * receipt on the shelf (R2), and tells the queue. Heartbeats while it works so a dead
 * worker's job goes back on the shelf, and ticks a pulse row so the panel can say
 * READY or OUT OF ORDER truthfully.
 *
 * Several machines share one queue with no coordination: Postgres hands each coin to
 * exactly one of them (SKIP LOCKED). Each machine says which providers it will vend
 * and which it is cooling on, and only claims coins it is good for right now. A bot
 * wall or a rate limit is a route failure: the coin goes back on the shelf with its
 * attempt intact, this machine sits that provider out for a while, and another
 * machine (a Mac at home, say) takes it. Human-scale pacing per provider on top.
 *
 *   npm run remora:worker          locally, against a Neon branch
 *   npm run remora:install         on a Mac, under launchd
 *   fly deploy (workers/remora)    the always-on box
 *
 * Env: NEON_DATABASE_URL, the REMORA_R2_* set, REMORA_MACHINE_NAME (default hostname),
 * REMORA_PROVIDERS (comma list, default all), REMORA_PER_HOUR (default 30),
 * REMORA_YOUTUBE_PER_HOUR (default 12), REMORA_TICK_MS (idle poll, default 5000),
 * REMORA_TTL_DAYS (shelf life, default 7).
 */
import "../../src/remora/env.ts"; // .env.local → process.env, first
import { mkdtemp, rm, stat } from "node:fs/promises";
import { hostname, tmpdir } from "node:os";
import { basename, join } from "node:path";
import { backoffSeconds, isPermanentError, MAX_ATTEMPTS, type Job } from "../../src/remora/core/job.ts";
import { fraction } from "../../src/remora/core/progress.ts";
import {
  availableProviders,
  isRouteError,
  parseCapabilities,
  RateWindow,
  ROUTE_COOLDOWN_MS,
  withCooldown,
  type Cooldowns,
} from "../../src/remora/core/route.ts";
import { dbWired } from "../../src/remora/db/client.ts";
import {
  addAsset,
  beat,
  claimNextJob,
  complete,
  expiredAssets,
  fail,
  heartbeat,
  markDeleted,
  recoverStale,
  type Pulse,
} from "../../src/remora/db/queue.ts";
import { contentTypeFor, deleteObject, putFile, shelfWired } from "../../src/remora/storage.ts";
import { returnCoin } from "../../src/remora/db/coins.ts";
import { pemFromEnv } from "../../src/remora/core/receipt.ts";
import { ffmpegVersion, sha256File, vend } from "../../src/remora/vend.ts";
import { ytDlpVersion } from "../../src/remora/ytdlp.ts";

const NAME = process.env.REMORA_MACHINE_NAME || hostname().toLowerCase();
const TICK_MS = Number(process.env.REMORA_TICK_MS ?? 5000);
const TTL_DAYS = Number(process.env.REMORA_TTL_DAYS ?? 7);
const HEARTBEAT_MS = 15_000;
const CAPABILITIES = parseCapabilities(process.env.REMORA_PROVIDERS);
const PER_HOUR = Number(process.env.REMORA_PER_HOUR ?? 30);
const YOUTUBE_PER_HOUR = Number(process.env.REMORA_YOUTUBE_PER_HOUR ?? 12);

const log = (msg: string) => console.log(`${new Date().toISOString()} ${NAME}: ${msg}`);

let running = true;
for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    log(`${sig}, finishing the current vend`);
    running = false;
  });
}

/** What this machine is sitting out, and until when. Persisted on every beat. */
let cooldowns: Cooldowns = {};
const pace = new RateWindow((provider) => (provider === "youtube" ? YOUTUBE_PER_HOUR : PER_HOUR));

async function main(): Promise<void> {
  if (!dbWired()) throw new Error("NEON_DATABASE_URL is not set; the machine has no queue");
  if (!shelfWired()) throw new Error("the shelf is not wired; set the REMORA_R2_* variables");
  if (CAPABILITIES.length === 0) throw new Error("REMORA_PROVIDERS names no provider the machine knows");

  const tools = { name: NAME, ytDlp: await ytDlpVersion().catch(() => null), ffmpeg: await ffmpegVersion() };
  const signs = pemFromEnv(process.env.REMORA_RECEIPT_PRIVATE_KEY) !== null;
  log(`receipts ${signs ? "signed" : "UNSIGNED (no REMORA_RECEIPT_PRIVATE_KEY)"}`);
  log(
    `plugged in · yt-dlp ${tools.ytDlp ?? "missing"} · ffmpeg ${tools.ffmpeg ?? "missing"} · vends ${CAPABILITIES.join(",")} · ` +
      `pace ${PER_HOUR}/h (youtube ${YOUTUBE_PER_HOUR}/h) · tick ${TICK_MS}ms · ttl ${TTL_DAYS}d`,
  );
  const pulse = (): Pulse => ({ ...tools, providers: CAPABILITIES, cooldowns });
  await beat(pulse());

  let lastProviders = "";
  while (running) {
    const now = new Date();
    const recovered = await recoverStale();
    if (recovered > 0) log(`put ${recovered} stale job(s) back on the shelf`);

    // Pace is a cooldown too, published like one, so the panel and other machines see it.
    for (const p of CAPABILITIES) {
      const retryAt = pace.retryAt(p, now);
      if (retryAt && !(p in cooldowns)) cooldowns = { ...cooldowns, [p]: retryAt.toISOString() };
    }
    // Only claim what this machine is good for right now: not cooling, not over pace.
    const providers = availableProviders(CAPABILITIES, cooldowns, now);
    const key = providers.join(",");
    if (key !== lastProviders) {
      log(providers.length ? `claiming: ${key}` : "claiming nothing: everything is cooling or over pace");
      lastProviders = key;
    }

    const job = await claimNextJob(NAME, providers);
    if (job) {
      await process_(job, pulse);
      continue; // straight to the next coin
    }

    await sweep();
    await beat(pulse());
    await sleep(TICK_MS);
  }
  log("unplugged");
}

async function process_(job: Job, pulse: () => Pulse): Promise<void> {
  log(`claimed ${job.id} · ${job.provider} · ${job.quality} · attempt ${job.attempts}${job.routeFailures ? ` · ${job.routeFailures} door(s) so far` : ""}`);
  const dir = await mkdtemp(join(tmpdir(), "remora-"));
  let lastBeat = Date.now();
  let title: string | null = null;

  const tick = async (progress: number | null) => {
    const ours = await heartbeat(job.id, NAME, progress, title);
    lastBeat = Date.now();
    if (!ours) log(`${job.id} is no longer ours (recovered by someone else?); finishing anyway`);
  };

  try {
    const v = await vend({
      input: job.input,
      quality: job.quality,
      dir,
      card: job.cardId,
      machine: NAME,
      onEstimate: (meta) => {
        title = meta.title;
        void tick(0);
      },
      onTick: (t) => {
        if (t.kind !== "download" || Date.now() - lastBeat < HEARTBEAT_MS) return;
        void tick(fraction(t));
      },
    });

    const expiresAt = new Date(Date.now() + TTL_DAYS * 86_400_000).toISOString();
    const fileName = basename(v.filepath);
    const receiptName = basename(v.receiptPath);
    const prefix = `vends/${job.id}`;

    await tick(0.99);
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
    const [receiptBytes, receiptSha] = await Promise.all([stat(v.receiptPath).then((s) => s.size), sha256File(v.receiptPath)]);
    await addAsset({
      jobId: job.id,
      kind: "receipt",
      objectKey: `${prefix}/${receiptName}`,
      fileName: receiptName,
      bytes: receiptBytes,
      sha256: receiptSha,
      contentType: "application/json",
      expiresAt,
    });

    await complete(job.id, NAME, v.receipt.video.title);
    pace.record(job.provider, new Date());
    await beat(pulse(), 1);
    log(`CLUNK ${job.id} · ${fileName} · ${v.receipt.file.bytes} B · ${v.seconds.toFixed(1)}s`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    let outcome: string;
    if (isRouteError(message)) {
      cooldowns = withCooldown(cooldowns, job.provider, new Date());
      outcome = ` · ${job.provider} door closed to this machine: cooling ${ROUTE_COOLDOWN_MS / 60_000} min, coin back on the shelf for another machine`;
    } else if (isPermanentError(message) || job.attempts >= MAX_ATTEMPTS) {
      outcome = " · giving up";
    } else {
      outcome = ` · again in ${backoffSeconds(job.attempts)}s`;
    }
    log(`nothing dropped for ${job.id}: ${message.slice(0, 160)}${outcome}`);
    await fail(job.id, NAME, message.slice(0, 500));
    if (job.cardId && (await returnCoin(job.id))) log(`coin returned to ${job.cardId}`);
    await beat(pulse());
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
