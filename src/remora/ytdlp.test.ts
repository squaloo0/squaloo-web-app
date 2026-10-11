/**
 * The error edges of the yt-dlp wrapper, without a network and without yt-dlp.
 * The happy path is exercised by hand with `npm run remora -- info <url>`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { YtDlpError, run, ytDlpInfo, ytDlpVersion } from "./ytdlp.ts";

const URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

test("a missing binary is a not-found error, not a crash", async () => {
  await assert.rejects(
    ytDlpInfo(URL, { bin: "/nonexistent/remora-yt-dlp" }),
    (e: unknown) => e instanceof YtDlpError && e.kind === "not-found",
  );
});

test("a non-zero exit is an exit error carrying the code", async () => {
  // `false` ignores its arguments and exits 1.
  await assert.rejects(
    ytDlpVersion({ bin: "false" }),
    (e: unknown) => e instanceof YtDlpError && e.kind === "exit" && e.exitCode === 1,
  );
});

test("a zero exit with non-JSON output is a bad-json error", async () => {
  // `true` exits 0 and prints nothing, which is not a video.
  await assert.rejects(
    ytDlpInfo(URL, { bin: "true" }),
    (e: unknown) => e instanceof YtDlpError && e.kind === "bad-json",
  );
});

test("a timeout kills the child and says so", async () => {
  // node itself, told to idle for longer than the budget.
  const started = Date.now();
  await assert.rejects(
    run(["-e", "setTimeout(() => {}, 5000)"], { bin: process.execPath, timeoutMs: 200 }),
    (e: unknown) => e instanceof YtDlpError && e.kind === "timeout",
  );
  assert.ok(Date.now() - started < 3000, "the child was not killed");
});

test("stdout comes back whole, stderr is kept as a tail", async () => {
  const r = await run(["-e", "process.stdout.write('{\"a\":1}'); process.stderr.write('warn')"], { bin: process.execPath });
  assert.equal(r.stdout, '{"a":1}');
  assert.equal(r.stderr, "warn");
});
