/**
 * A job is one coin in the slot: a URL, a quality, and what happened to it.
 *
 *   pending ──claim──▶ processing ──complete──▶ completed
 *      ▲                   │  │
 *      └──────stale────────┘  └──fail──▶ failed (or back to pending while attempts remain)
 *
 * Pure. The SQL in db/queue.ts does the same transitions atomically; this file is the
 * spec the SQL is checked against, and what the panel and worker reason with.
 */
import type { Quality } from "./format.ts";
import type { Provider } from "./url.ts";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type Job = {
  id: string;
  input: string;
  canonicalUrl: string;
  provider: Provider;
  quality: Quality;
  status: JobStatus;
  attempts: number;
  /** Worker that holds the claim, while processing. */
  claimedBy: string | null;
  /** ISO. Refreshed by the heartbeat while processing. */
  claimedAt: string | null;
  /** 0..1 while processing, when the worker has said. */
  progress: number | null;
  /** Machine language, when failed. */
  error: string | null;
  title: string | null;
  createdAt: string;
  updatedAt: string;
};

export const MAX_ATTEMPTS = 3;

/** A claim older than this with no heartbeat is a dead worker; the job goes back on the shelf. */
export const STALE_AFTER_MS = 10 * 60_000;

/** The machine is OUT OF ORDER when its last heartbeat is older than this. */
export const MACHINE_SILENT_AFTER_MS = 90_000;

export type JobEvent =
  | { type: "claim"; by: string; at: string }
  | { type: "heartbeat"; at: string; progress: number | null; title?: string | null }
  | { type: "complete"; at: string; title: string | null }
  | { type: "fail"; at: string; error: string }
  | { type: "stale"; at: string };

/**
 * Some failures will not get better by trying again in a minute: the video is gone,
 * private, a live stream, or the host wants a human. Those fail on the first attempt.
 * Everything else (network, a 5xx, a timeout) is worth another go, after a pause.
 */
export function isPermanentError(message: string): boolean {
  return /Sign in to confirm|not a bot|Private video|Video unavailable|has been removed|This video is not available|is not a URL|live stream|no longer available|members-only|age-restricted|HTTP Error 40[134]/i.test(
    message,
  );
}

/**
 * The panel's version of an error: yt-dlp's prefix gone, first sentence only.
 * "yt-dlp exited 1: ERROR: [youtube] abc: Sign in to confirm you’re not a bot. Use --cookies…"
 * → "Sign in to confirm you’re not a bot."
 */
export function shortError(message: string | null): string | null {
  if (message === null) return null;
  const stripped = message.replace(/^yt-dlp (exited \d+|killed by \w+): /, "").replace(/^ERROR: /, "").replace(/^\[[\w-]+\] [^:]+: /, "");
  const sentence = /^(.*?[.!?])(\s|$)/.exec(stripped)?.[1] ?? stripped;
  return sentence.length > 140 ? sentence.slice(0, 137) + "…" : sentence;
}

/** Seconds to wait before attempt n+1 after attempt n failed: 30 s, 2 min, 4.5 min. */
export function backoffSeconds(attempts: number): number {
  return 30 * attempts * attempts;
}

export class JobTransitionError extends Error {
  constructor(job: Job, event: JobEvent) {
    super(`job ${job.id} is ${job.status}; cannot ${event.type}`);
    this.name = "JobTransitionError";
  }
}

/** Apply one event. Throws when the event does not fit the state. */
export function reduce(job: Job, event: JobEvent): Job {
  switch (event.type) {
    case "claim":
      if (job.status !== "pending") throw new JobTransitionError(job, event);
      return {
        ...job,
        status: "processing",
        attempts: job.attempts + 1,
        claimedBy: event.by,
        claimedAt: event.at,
        progress: 0,
        error: null,
        updatedAt: event.at,
      };
    case "heartbeat":
      if (job.status !== "processing") throw new JobTransitionError(job, event);
      return { ...job, claimedAt: event.at, progress: event.progress, title: event.title ?? job.title, updatedAt: event.at };
    case "complete":
      if (job.status !== "processing") throw new JobTransitionError(job, event);
      return { ...job, status: "completed", progress: 1, title: event.title ?? job.title, claimedBy: null, updatedAt: event.at };
    case "fail": {
      if (job.status !== "processing") throw new JobTransitionError(job, event);
      const retry = job.attempts < MAX_ATTEMPTS && !isPermanentError(event.error);
      return {
        ...job,
        status: retry ? "pending" : "failed",
        error: event.error,
        progress: null,
        claimedBy: null,
        claimedAt: null,
        updatedAt: event.at,
      };
    }
    case "stale":
      if (job.status !== "processing") throw new JobTransitionError(job, event);
      return {
        ...job,
        status: job.attempts < MAX_ATTEMPTS ? "pending" : "failed",
        error: job.attempts < MAX_ATTEMPTS ? job.error : "the machine stopped mid-vend",
        progress: null,
        claimedBy: null,
        claimedAt: null,
        updatedAt: event.at,
      };
  }
}

/** Has this processing job's worker gone quiet for too long? */
export function isStale(job: Job, now: Date): boolean {
  if (job.status !== "processing" || job.claimedAt === null) return false;
  return now.getTime() - Date.parse(job.claimedAt) > STALE_AFTER_MS;
}

export function isActive(job: Job): boolean {
  return job.status === "pending" || job.status === "processing";
}

/** Front-panel words for a status. */
export function pill(job: Job): { text: string; tone: "dim" | "lit" | "green" | "red" } {
  switch (job.status) {
    case "pending":
      return { text: job.attempts > 0 ? `retry ${job.attempts + 1}/${MAX_ATTEMPTS}` : "queued", tone: "dim" };
    case "processing":
      return { text: job.progress === null ? "vending" : `vending ${Math.floor(job.progress * 100)}%`, tone: "lit" };
    case "completed":
      return { text: "dropped", tone: "green" };
    case "failed":
      return { text: "nothing dropped", tone: "red" };
  }
}

export type Machine = {
  name: string;
  lastSeen: string;
  ytDlp: string | null;
  ffmpeg: string | null;
  vends: number;
};

/** The light on the front: green when a worker has checked in recently. */
export function machineLight(machine: Machine | null, now: Date): { on: boolean; text: string } {
  if (!machine) return { on: false, text: "OUT OF ORDER · no machine has ever checked in" };
  const silentMs = now.getTime() - Date.parse(machine.lastSeen);
  if (silentMs > MACHINE_SILENT_AFTER_MS) {
    return { on: false, text: `OUT OF ORDER · ${machine.name} last seen ${Math.round(silentMs / 60_000)} min ago · jobs are safe` };
  }
  return { on: true, text: `${machine.name} · ${machine.vends} vends` };
}
