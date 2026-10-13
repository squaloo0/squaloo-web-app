import { test } from "node:test";
import assert from "node:assert/strict";
import { backoffSeconds, shortError, isActive, isPermanentError, isStale, JobTransitionError, machineLight, MAX_ATTEMPTS, pill, reduce, STALE_AFTER_MS, type Job } from "./job.ts";

const T0 = "2026-10-11T00:00:00.000Z";
const T1 = "2026-10-11T00:01:00.000Z";

function job(patch: Partial<Job> = {}): Job {
  return {
    id: "j1",
    input: "https://youtu.be/dQw4w9WgXcQ",
    canonicalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    provider: "youtube",
    quality: "best",
    status: "pending",
    attempts: 0,
    routeFailures: 0,
    notBefore: null,
    claimedBy: null,
    claimedAt: null,
    progress: null,
    error: null,
    title: null,
    cardId: null,
    createdAt: T0,
    updatedAt: T0,
    ...patch,
  };
}

test("the happy path: pending → processing → completed", () => {
  const claimed = reduce(job(), { type: "claim", by: "air", at: T0 });
  assert.equal(claimed.status, "processing");
  assert.equal(claimed.attempts, 1);
  assert.equal(claimed.claimedBy, "air");
  const beating = reduce(claimed, { type: "heartbeat", at: T1, progress: 0.4, title: "Rick" });
  assert.equal(beating.progress, 0.4);
  assert.equal(beating.claimedAt, T1);
  assert.equal(beating.title, "Rick");
  const done = reduce(beating, { type: "complete", at: T1, title: null });
  assert.equal(done.status, "completed");
  assert.equal(done.progress, 1);
  assert.equal(done.title, "Rick", "a null title on complete keeps what the heartbeat said");
  assert.equal(done.claimedBy, null);
  assert.equal(isActive(done), false);
});

test("a failure goes back on the shelf until attempts run out", () => {
  let j = job();
  for (let n = 1; n <= MAX_ATTEMPTS; n++) {
    j = reduce(j, { type: "claim", by: "air", at: T0 });
    assert.equal(j.attempts, n);
    j = reduce(j, { type: "fail", at: T1, error: `boom ${n}` });
    assert.equal(j.error, `boom ${n}`);
    assert.equal(j.status, n < MAX_ATTEMPTS ? "pending" : "failed");
    assert.equal(j.claimedBy, null);
  }
  assert.equal(pill(j).text, "nothing dropped");
});

test("a stale claim is a dead worker: back to pending, or failed on the last attempt", () => {
  const fresh = reduce(job(), { type: "claim", by: "air", at: T0 });
  assert.equal(isStale(fresh, new Date(Date.parse(T0) + STALE_AFTER_MS - 1)), false);
  assert.equal(isStale(fresh, new Date(Date.parse(T0) + STALE_AFTER_MS + 1)), true);
  assert.equal(isStale(job(), new Date()), false, "pending jobs are never stale");

  const back = reduce(fresh, { type: "stale", at: T1 });
  assert.equal(back.status, "pending");
  assert.equal(back.error, null);

  const last = reduce(job({ attempts: MAX_ATTEMPTS - 1 }), { type: "claim", by: "air", at: T0 });
  const dead = reduce(last, { type: "stale", at: T1 });
  assert.equal(dead.status, "failed");
  assert.match(dead.error ?? "", /stopped mid-vend/);
});

test("events that do not fit the state throw", () => {
  assert.throws(() => reduce(job(), { type: "heartbeat", at: T0, progress: 0 }), JobTransitionError);
  assert.throws(() => reduce(job(), { type: "complete", at: T0, title: null }), JobTransitionError);
  assert.throws(() => reduce(job({ status: "completed" }), { type: "claim", by: "x", at: T0 }), JobTransitionError);
  assert.throws(() => reduce(job({ status: "failed" }), { type: "stale", at: T0 }), JobTransitionError);
});

test("pills", () => {
  assert.deepEqual(pill(job()), { text: "queued", tone: "dim" });
  assert.deepEqual(pill(job({ attempts: 1 })), { text: `retry 2/${MAX_ATTEMPTS}`, tone: "dim" });
  assert.deepEqual(pill(job({ status: "processing", progress: null })), { text: "vending", tone: "lit" });
  assert.deepEqual(pill(job({ status: "processing", progress: 0.456 })), { text: "vending 45%", tone: "lit" });
  assert.deepEqual(pill(job({ status: "completed" })), { text: "dropped", tone: "green" });
});

test("the machine light", () => {
  const now = new Date(T1);
  assert.equal(machineLight(null, now).on, false);
  const fresh = { name: "fly-1", lastSeen: T1, ytDlp: "x", ffmpeg: "y", vends: 3, providers: ["youtube"], cooldowns: {} };
  assert.deepEqual(machineLight(fresh, now), { on: true, text: "lantern · 3 vends" });
  const silent = { ...fresh, lastSeen: T0 };
  const light = machineLight(silent, new Date(Date.parse(T0) + 10 * 60_000));
  assert.equal(light.on, false);
  assert.match(light.text, /OUT OF ORDER · lantern last seen 10 min ago · jobs are safe/);
});

test("a permanent error fails on the first attempt; a transient one goes back on the shelf with a pause", () => {
  const claimed = reduce(job(), { type: "claim", by: "air", at: T0 });
  const gone = reduce(claimed, { type: "fail", at: T1, error: "yt-dlp exited 1: ERROR: [youtube] x: Private video" });
  assert.equal(gone.status, "failed");
  const net = reduce(claimed, { type: "fail", at: T1, error: "yt-dlp exited 1: ERROR: Unable to download webpage: <urlopen error timed out>" });
  assert.equal(net.status, "pending");
  assert.equal(net.notBefore, new Date(Date.parse(T1) + 30_000).toISOString());
});

test("a bot wall is a route failure: the attempt is given back, the door is counted, the coin is shelved a minute", () => {
  const claimed = reduce(job(), { type: "claim", by: "fly", at: T0 });
  const bot = reduce(claimed, { type: "fail", at: T1, error: "yt-dlp exited 1: ERROR: [youtube] x: Sign in to confirm you’re not a bot." });
  assert.equal(bot.status, "pending");
  assert.equal(bot.attempts, 0);
  assert.equal(bot.routeFailures, 1);
  assert.equal(bot.notBefore, new Date(Date.parse(T1) + 60_000).toISOString());
  // too many doors and the coin is declared stuck
  let j = job({ routeFailures: 7 });
  j = reduce(j, { type: "claim", by: "fly", at: T0 });
  j = reduce(j, { type: "fail", at: T1, error: "HTTP Error 429: Too Many Requests" });
  assert.equal(j.status, "failed");
  assert.equal(j.routeFailures, 8);
});

test("what counts as permanent", () => {
  for (const m of ["Private video", "Video unavailable", "This video has been removed", "that is a live stream", "HTTP Error 403: Forbidden", "members-only content", "ERROR: [vimeo] 22439234: The web client only works when logged-in. Use --cookies"]) {
    assert.equal(isPermanentError(m), true, m);
  }
  for (const m of ["Sign in to confirm you’re not a bot", "timed out", "HTTP Error 503: Service Unavailable", "ECONNRESET", "yt-dlp took longer than 1800000 ms"]) {
    assert.equal(isPermanentError(m), false, m);
  }
});

test("backoff grows", () => {
  assert.deepEqual([1, 2, 3].map(backoffSeconds), [30, 120, 270]);
});

test("the panel shows the first sentence without yt-dlp's prefix", () => {
  assert.equal(
    shortError("yt-dlp exited 1: ERROR: [youtube] aqz-KE-bpKQ: Sign in to confirm you’re not a bot. Use --cookies-from-browser or --cookies for the authentication."),
    "Sign in to confirm you’re not a bot.",
  );
  assert.equal(shortError("yt-dlp took longer than 1800000 ms"), "yt-dlp took longer than 1800000 ms");
  assert.equal(shortError("that is a live stream; the machine vends files"), "that is a live stream; the machine vends files");
  assert.equal(shortError(null), null);
  assert.equal(shortError("x".repeat(200))!.length, 138);
});
