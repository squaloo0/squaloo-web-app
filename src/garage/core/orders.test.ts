import { test } from "node:test";
import assert from "node:assert/strict";
import { dueOrders, isDue, orderLine, parseEveryHours, type Order } from "./orders.ts";

const base: Order = { id: 1, hat: "study", prompt: null, ticket: "GARAGE-7", everyHours: 24, enabled: true, lastQueuedAt: null, runs: 0, createdBy: "founder", createdAt: "2026-10-13T09:00:00.000Z" };
const now = new Date("2026-10-14T10:00:00.000Z");

test("an order is due when never queued, or when its interval has passed, and never when off", () => {
  assert.equal(isDue(base, now), true, "never queued");
  assert.equal(isDue({ ...base, lastQueuedAt: "2026-10-13T09:59:00.000Z" }, now), true, "24h and a minute ago");
  assert.equal(isDue({ ...base, lastQueuedAt: "2026-10-13T10:01:00.000Z" }, now), false, "23h59 ago");
  assert.equal(isDue({ ...base, enabled: false }, now), false);
  assert.equal(isDue({ ...base, hat: "propose" }, now), false, "a proposal never runs on a schedule below rung 2");
  assert.deepEqual(dueOrders([base, { ...base, id: 2, enabled: false }], now).map((o) => o.id), [1]);
});

test("the line and the interval parser carry their boundaries", () => {
  assert.equal(orderLine({ ...base, lastQueuedAt: "2026-10-13T09:00:00.000Z", runs: 3 }), "#1 · study GARAGE-7 · every 24h · on · last 2026-10-13 09:00Z · 3 runs");
  assert.equal(orderLine(base), "#1 · study GARAGE-7 · every 24h · on · never queued · 0 runs");
  assert.equal(parseEveryHours("24"), 24);
  assert.equal(parseEveryHours("0"), null);
  assert.equal(parseEveryHours("1.5"), null);
  assert.equal(parseEveryHours("400"), null);
  assert.equal(parseEveryHours(undefined), null);
});
