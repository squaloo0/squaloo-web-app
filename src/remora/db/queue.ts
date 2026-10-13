/**
 * The queue, as five statements. Every transition here mirrors core/job.ts; the SQL is
 * single statements so it is atomic over Neon's HTTP driver without a transaction.
 *
 * I/O edge. Rows come back snake_case from Postgres and leave here as core Job values.
 */
import { randomBytes } from "node:crypto";
import { sql } from "./client.ts";
import { backoffSeconds, isPermanentError, MACHINE_SILENT_AFTER_MS, MAX_ATTEMPTS, STALE_AFTER_MS, type Job, type JobStatus, type Machine } from "../core/job.ts";
import { isRouteError, MAX_ROUTE_FAILURES, ROUTE_RETRY_MS, type Cooldowns } from "../core/route.ts";
import type { Quality } from "../core/format.ts";
import type { Provider } from "../core/url.ts";
import type { Clip } from "../core/clip.ts";

export function newId(prefix: "j" | "a"): string {
  return `${prefix}_${randomBytes(15).toString("base64url")}`;
}

export type JobRow = {
  id: string;
  input: string;
  canonical_url: string;
  provider: string;
  quality: string;
  clip_start?: number | string | null;
  clip_end?: number | string | null;
  status: string;
  attempts: number;
  route_failures: number;
  not_before: string | Date | null;
  claimed_by: string | null;
  claimed_at: string | Date | null;
  progress: number | null;
  error: string | null;
  title: string | null;
  card_id?: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

function iso(v: string | Date): string {
  return v instanceof Date ? v.toISOString() : new Date(v).toISOString();
}

export function toJob(r: JobRow): Job {
  return {
    id: r.id,
    input: r.input,
    canonicalUrl: r.canonical_url,
    provider: r.provider as Provider,
    quality: r.quality as Quality,
    clip: r.clip_start !== null && r.clip_start !== undefined && r.clip_end !== null && r.clip_end !== undefined ? { start: Number(r.clip_start), end: Number(r.clip_end) } : null,
    status: r.status as JobStatus,
    attempts: r.attempts,
    routeFailures: r.route_failures ?? 0,
    notBefore: r.not_before === null || r.not_before === undefined ? null : iso(r.not_before),
    claimedBy: r.claimed_by,
    claimedAt: r.claimed_at === null ? null : iso(r.claimed_at),
    progress: r.progress,
    error: r.error,
    title: r.title,
    cardId: r.card_id ?? null,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
}

export type Coin = { input: string; canonicalUrl: string; provider: Provider; quality: Quality; clip?: Clip | null };

export async function enqueue(input: Coin): Promise<Job> {
  const id = newId("j");
  const rows = (await sql()`
    INSERT INTO remora_jobs (id, input, canonical_url, provider, quality, clip_start, clip_end)
    VALUES (${id}, ${input.input}, ${input.canonicalUrl}, ${input.provider}, ${input.quality}, ${input.clip?.start ?? null}, ${input.clip?.end ?? null})
    RETURNING *`) as JobRow[];
  return toJob(rows[0]);
}

/**
 * Take the oldest pending job, atomically. The subquery locks one row with SKIP LOCKED
 * so two workers never claim the same coin; the UPDATE is the claim event.
 */
export async function claimNextJob(worker: string, providers: readonly string[], can: { transcribe: boolean } = { transcribe: false }): Promise<Job | null> {
  if (providers.length === 0) return null;
  const rows = (await sql()`
    UPDATE remora_jobs
       SET status = 'processing',
           attempts = attempts + 1,
           claimed_by = ${worker},
           claimed_at = now(),
           progress = 0,
           error = NULL,
           updated_at = now()
     WHERE id = (
       SELECT id FROM remora_jobs
        WHERE status = 'pending' AND (not_before IS NULL OR not_before <= now())
          AND provider = ANY(${[...providers]})
          AND (quality <> 'transcript' OR ${can.transcribe})
        ORDER BY created_at
        FOR UPDATE SKIP LOCKED
        LIMIT 1
     )
    RETURNING *`) as JobRow[];
  return rows[0] ? toJob(rows[0]) : null;
}

/** Refresh the claim and report progress. Returns false if the job is no longer ours. */
export async function heartbeat(id: string, worker: string, progress: number | null, title: string | null): Promise<boolean> {
  const rows = (await sql()`
    UPDATE remora_jobs
       SET claimed_at = now(), progress = ${progress}, title = COALESCE(${title}, title), updated_at = now()
     WHERE id = ${id} AND status = 'processing' AND claimed_by = ${worker}
    RETURNING id`) as { id: string }[];
  return rows.length === 1;
}

export async function complete(id: string, worker: string, title: string | null): Promise<void> {
  await sql()`
    UPDATE remora_jobs
       SET status = 'completed', progress = 1, title = COALESCE(${title}, title), claimed_by = NULL, updated_at = now()
     WHERE id = ${id} AND status = 'processing' AND claimed_by = ${worker}`;
}

/**
 * A route failure (bot wall, rate limit) gives the attempt back, counts the door and
 * shelves the coin a minute for another machine. Otherwise: back on the shelf while
 * attempts remain and the error is worth retrying, with a growing pause; else failed.
 * Same rules as core/job fail.
 */
export async function fail(id: string, worker: string, error: string): Promise<void> {
  const route = isRouteError(error);
  const permanent = isPermanentError(error);
  await sql()`
    UPDATE remora_jobs
       SET status = CASE WHEN ${route} THEN (CASE WHEN route_failures + 1 >= ${MAX_ROUTE_FAILURES} THEN 'failed' ELSE 'pending' END)
                         WHEN attempts < ${MAX_ATTEMPTS} AND NOT ${permanent} THEN 'pending'
                         ELSE 'failed' END,
           attempts = CASE WHEN ${route} THEN attempts - 1 ELSE attempts END,
           route_failures = route_failures + CASE WHEN ${route} THEN 1 ELSE 0 END,
           not_before = CASE WHEN ${route} THEN now() + make_interval(secs => ${ROUTE_RETRY_MS / 1000})
                             WHEN attempts < ${MAX_ATTEMPTS} AND NOT ${permanent} THEN now() + make_interval(secs => 30 * attempts * attempts)
                             ELSE NULL END,
           error = ${error}, progress = NULL, claimed_by = NULL, claimed_at = NULL, updated_at = now()
     WHERE id = ${id} AND status = 'processing' AND claimed_by = ${worker}`;
}

/** Exposed so the worker can log the pause it is about to take. */
export { backoffSeconds };

/** Claims whose heartbeat stopped: a dead worker. Same rule as core/job stale. */
export async function recoverStale(): Promise<number> {
  const rows = (await sql()`
    UPDATE remora_jobs
       SET status = CASE WHEN attempts < ${MAX_ATTEMPTS} THEN 'pending' ELSE 'failed' END,
           error = CASE WHEN attempts < ${MAX_ATTEMPTS} THEN error ELSE 'the machine stopped mid-vend' END,
           progress = NULL, claimed_by = NULL, claimed_at = NULL, updated_at = now()
     WHERE status = 'processing' AND claimed_at < now() - make_interval(secs => ${STALE_AFTER_MS / 1000})
    RETURNING id`) as { id: string }[];
  return rows.length;
}

export async function getJob(id: string): Promise<Job | null> {
  const rows = (await sql()`SELECT * FROM remora_jobs WHERE id = ${id}`) as JobRow[];
  return rows[0] ? toJob(rows[0]) : null;
}

export async function listJobs(limit = 50): Promise<Job[]> {
  const rows = (await sql()`SELECT * FROM remora_jobs ORDER BY created_at DESC LIMIT ${limit}`) as JobRow[];
  return rows.map(toJob);
}

// --- the shelf -------------------------------------------------------------------

export type Asset = {
  id: string;
  jobId: string;
  kind: "video" | "audio" | "gif" | "thumbs" | "transcript" | "receipt";
  objectKey: string;
  fileName: string;
  bytes: number;
  sha256: string;
  contentType: string;
  expiresAt: string;
  deletedAt: string | null;
};

type AssetRow = {
  id: string;
  job_id: string;
  kind: string;
  object_key: string;
  file_name: string;
  bytes: string | number;
  sha256: string;
  content_type: string;
  expires_at: string | Date;
  deleted_at: string | Date | null;
};

function toAsset(r: AssetRow): Asset {
  return {
    id: r.id,
    jobId: r.job_id,
    kind: r.kind as Asset["kind"],
    objectKey: r.object_key,
    fileName: r.file_name,
    bytes: Number(r.bytes),
    sha256: r.sha256,
    contentType: r.content_type,
    expiresAt: iso(r.expires_at),
    deletedAt: r.deleted_at === null ? null : iso(r.deleted_at),
  };
}

export async function addAsset(a: Omit<Asset, "id" | "deletedAt">): Promise<Asset> {
  const id = newId("a");
  const rows = (await sql()`
    INSERT INTO remora_assets (id, job_id, kind, object_key, file_name, bytes, sha256, content_type, expires_at)
    VALUES (${id}, ${a.jobId}, ${a.kind}, ${a.objectKey}, ${a.fileName}, ${a.bytes}, ${a.sha256}, ${a.contentType}, ${a.expiresAt})
    RETURNING *`) as AssetRow[];
  return toAsset(rows[0]);
}

export async function assetsForJobs(jobIds: string[]): Promise<Asset[]> {
  if (jobIds.length === 0) return [];
  const rows = (await sql()`SELECT * FROM remora_assets WHERE job_id = ANY(${jobIds}) AND deleted_at IS NULL ORDER BY kind`) as AssetRow[];
  return rows.map(toAsset);
}

export async function assetsForJob(jobId: string): Promise<Asset[]> {
  const rows = (await sql()`SELECT * FROM remora_assets WHERE job_id = ${jobId} AND deleted_at IS NULL ORDER BY kind`) as AssetRow[];
  return rows.map(toAsset);
}

/** Assets past their expiry that are still on the shelf. The sweep deletes them from R2 and marks here. */
export async function expiredAssets(limit = 20): Promise<Asset[]> {
  const rows = (await sql()`
    SELECT * FROM remora_assets WHERE deleted_at IS NULL AND expires_at < now() ORDER BY expires_at LIMIT ${limit}`) as AssetRow[];
  return rows.map(toAsset);
}

export async function markDeleted(id: string): Promise<void> {
  await sql()`UPDATE remora_assets SET deleted_at = now() WHERE id = ${id}`;
}

// --- the pulse -------------------------------------------------------------------

export type Pulse = { name: string; ytDlp: string | null; ffmpeg: string | null; providers: readonly string[]; cooldowns: Cooldowns; transcribe?: boolean };

/** `fresh` on a process's first beat resets started_at, so uptime means this run, not the row's birth. */
export async function beat(machine: Pulse, vended = 0, opts: { fresh?: boolean } = {}): Promise<void> {
  const fresh = opts.fresh === true;
  await sql()`
    INSERT INTO remora_machine (name, last_seen, yt_dlp, ffmpeg, vends, providers, cooldowns, started_at, transcribe)
    VALUES (${machine.name}, now(), ${machine.ytDlp}, ${machine.ffmpeg}, ${vended}, ${[...machine.providers]}, ${JSON.stringify(machine.cooldowns)}::jsonb, now(), ${machine.transcribe === true})
    ON CONFLICT (name) DO UPDATE
      SET last_seen = now(), yt_dlp = EXCLUDED.yt_dlp, ffmpeg = EXCLUDED.ffmpeg,
          vends = remora_machine.vends + ${vended},
          providers = EXCLUDED.providers, cooldowns = EXCLUDED.cooldowns, transcribe = EXCLUDED.transcribe,
          started_at = CASE WHEN ${fresh} THEN now() ELSE remora_machine.started_at END`;
}

type MachineRow = {
  name: string;
  last_seen: string | Date;
  yt_dlp: string | null;
  ffmpeg: string | null;
  vends: number;
  providers: string[] | null;
  cooldowns: Cooldowns | string | null;
  transcribe?: boolean | null;
};

function toMachine(r: MachineRow): Machine {
  const cooldowns = typeof r.cooldowns === "string" ? (JSON.parse(r.cooldowns) as Cooldowns) : (r.cooldowns ?? {});
  return { name: r.name, lastSeen: iso(r.last_seen), ytDlp: r.yt_dlp, ffmpeg: r.ffmpeg, vends: r.vends, providers: r.providers ?? [], cooldowns, transcribe: r.transcribe === true };
}

/** The worker that checked in most recently. */
export async function freshestMachine(): Promise<Machine | null> {
  const rows = (await sql()`SELECT * FROM remora_machine ORDER BY last_seen DESC LIMIT 1`) as MachineRow[];
  return rows[0] ? toMachine(rows[0]) : null;
}

/** Every worker that has beaten recently, freshest first. */
export async function liveMachines(): Promise<Machine[]> {
  const rows = (await sql()`
    SELECT * FROM remora_machine WHERE last_seen > now() - make_interval(secs => ${MACHINE_SILENT_AFTER_MS / 1000}) ORDER BY last_seen DESC`) as MachineRow[];
  return rows.map(toMachine);
}

// --- migrations ------------------------------------------------------------------

/** Apply each (name, text) once, in order. Names are the file names; the table remembers. */
export async function migrate(files: { name: string; text: string }[]): Promise<string[]> {
  const applied: string[] = [];
  await sql()`CREATE TABLE IF NOT EXISTS remora_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
  const done = new Set(((await sql()`SELECT name FROM remora_migrations`) as { name: string }[]).map((r) => r.name));
  for (const f of files) {
    if (done.has(f.name)) continue;
    // Neon's HTTP driver runs one statement per call; a migration file is many.
    for (const statement of splitStatements(f.text)) {
      await sql()(statement);
    }
    await sql()`INSERT INTO remora_migrations (name) VALUES (${f.name})`;
    applied.push(f.name);
  }
  return applied;
}

/**
 * Split a migration into statements: strip `--` comments (whole-line and trailing), then
 * split on semicolons. Our migrations keep ';' and '--' out of string literals.
 */
export function splitStatements(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.replace(/--.*$/, "").trimEnd())
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
