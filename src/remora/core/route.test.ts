import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activeCooldowns,
  availableProviders,
  isRouteError,
  liveMachines,
  machineSummary,
  MAX_ROUTE_FAILURES,
  parseCapabilities,
  PROVIDERS,
  RateWindow,
  ROUTE_COOLDOWN_MS,
  waitingReason,
  withCooldown,
} from "./route.ts";
import { MACHINE_SILENT_AFTER_MS, type Machine } from "./job.ts";

const NOW = new Date("2026-10-11T06:00:00.000Z");
const later = (ms: number) => new Date(NOW.getTime() + ms);

function machine(patch: Partial<Machine> = {}): Machine {
  return { name: "air", lastSeen: NOW.toISOString(), ytDlp: "x", ffmpeg: "y", vends: 3, providers: [...PROVIDERS], cooldowns: {}, ...patch };
}

test("a bot wall or a 429 is a route error; a missing video is not", () => {
  for (const m of ["ERROR: [youtube] x: Sign in to confirm you’re not a bot.", "HTTP Error 429: Too Many Requests", "rate limited, try again later"]) {
    assert.equal(isRouteError(m), true, m);
  }
  for (const m of ["Private video", "Video unavailable", "HTTP Error 403: Forbidden", "timed out"]) {
    assert.equal(isRouteError(m), false, m);
  }
});

test("cooldowns start, hold, and end", () => {
  const c = withCooldown({}, "youtube", NOW);
  assert.deepEqual(availableProviders(PROVIDERS, c, NOW).includes("youtube"), false);
  assert.deepEqual(availableProviders(PROVIDERS, c, NOW).includes("vimeo"), true);
  assert.equal(availableProviders(PROVIDERS, c, later(ROUTE_COOLDOWN_MS - 1)).includes("youtube"), false);
  assert.equal(availableProviders(PROVIDERS, c, later(ROUTE_COOLDOWN_MS + 1)).includes("youtube"), true);
  assert.deepEqual(activeCooldowns(c, later(ROUTE_COOLDOWN_MS + 1)), {});
  // a second wall extends; an expired one is pruned on the way
  const c2 = withCooldown({ ...c, vimeo: later(-1).toISOString() }, "youtube", later(60_000));
  assert.equal(Object.keys(c2).join(), "youtube");
  assert.equal(c2.youtube, later(60_000 + ROUTE_COOLDOWN_MS).toISOString());
});

test("capabilities parse forgivingly", () => {
  assert.deepEqual(parseCapabilities(undefined), [...PROVIDERS]);
  assert.deepEqual(parseCapabilities("all"), [...PROVIDERS]);
  assert.deepEqual(parseCapabilities(" YouTube, vimeo ,nope"), ["youtube", "vimeo"]);
  assert.deepEqual(parseCapabilities("nope"), []);
});

test("the rate window is a rolling hour", () => {
  const w = new RateWindow((k) => (k === "youtube" ? 2 : 100));
  assert.equal(w.allow("youtube", NOW), true);
  w.record("youtube", NOW);
  w.record("youtube", later(60_000));
  assert.equal(w.allow("youtube", later(120_000)), false);
  assert.equal(w.retryAt("youtube", later(120_000))?.toISOString(), later(3_600_000).toISOString());
  assert.equal(w.allow("youtube", later(3_600_001)), true, "the first vend aged out");
  assert.equal(w.allow("vimeo", later(120_000)), true);
  assert.equal(w.retryAt("vimeo", NOW), null);
});

test("live machines and the waiting reason", () => {
  const fresh = machine();
  const silent = machine({ name: "mini", lastSeen: later(-MACHINE_SILENT_AFTER_MS - 1).toISOString() });
  assert.deepEqual(liveMachines([fresh, silent], NOW, MACHINE_SILENT_AFTER_MS).map((m) => m.name), ["air"]);

  const yt = { status: "pending" as const, provider: "youtube" as const };
  assert.equal(waitingReason(yt, [fresh], NOW), null);
  assert.equal(waitingReason(yt, [], NOW), "no machine is on");
  const cooling = machine({ name: "fly-sjc", cooldowns: withCooldown({}, "youtube", NOW) });
  assert.equal(waitingReason(yt, [cooling], later(2 * 60_000)), "no machine can vend youtube right now · fly-sjc cooling 28 min");
  assert.equal(waitingReason(yt, [cooling, fresh], NOW), null, "another machine can");
  const narrow = machine({ name: "fly-sjc", providers: ["vimeo"] });
  assert.equal(waitingReason(yt, [narrow], NOW), "no machine can vend youtube right now");
  assert.equal(waitingReason({ status: "completed", provider: "youtube" }, [], NOW), null);
});

test("machine summary", () => {
  assert.equal(machineSummary(machine(), NOW), "air · all providers · 3 vends");
  assert.equal(machineSummary(machine({ name: "fly-sjc", cooldowns: withCooldown({}, "youtube", NOW) }), later(60_000)), "fly-sjc · youtube cooling 29 min · 3 vends");
  assert.ok(MAX_ROUTE_FAILURES > 3);
});
