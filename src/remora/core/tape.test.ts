import { test } from "node:test";
import assert from "node:assert/strict";
import { dayOf, lastDays, parseBalanceTransactions, prettyMoney, prettyUptime, printTape, shortHash, sparkline, sumCharges, type Tape } from "./tape.ts";

const NOW = new Date("2026-10-12T19:30:00.000Z");

test("days are UTC and the window is zero-filled, oldest first", () => {
  assert.equal(dayOf("2026-10-12T23:59:59.000Z"), "2026-10-12");
  assert.equal(dayOf("2026-10-13T00:00:00.000Z"), "2026-10-13");
  const days = lastDays([{ day: "2026-10-12", vends: 3 }, { day: "2026-10-10", vends: 1 }, { day: "2026-09-01", vends: 99 }], NOW, 5);
  assert.deepEqual(
    days.map((d) => `${d.day.slice(5)}:${d.vends}`),
    ["10-08:0", "10-09:0", "10-10:1", "10-11:0", "10-12:3"],
  );
});

test("sparkline scales to the busiest day and leaves quiet days blank", () => {
  assert.equal(sparkline([{ day: "a", vends: 0 }, { day: "b", vends: 0 }]), "  ");
  const s = sparkline([{ day: "a", vends: 1 }, { day: "b", vends: 8 }, { day: "c", vends: 0 }, { day: "d", vends: 4 }]);
  assert.equal(s.length, 4);
  assert.equal(s[1], "█");
  assert.equal(s[2], " ");
  assert.equal(s[0], "▁");
  assert.equal(s[3], "▄");
});

test("money and uptime read like a receipt", () => {
  assert.equal(prettyMoney(0), "$0.00");
  assert.equal(prettyMoney(500), "$5.00");
  assert.equal(prettyMoney(123456), "$1,234.56");
  assert.equal(prettyMoney(-45), "-$0.45");
  assert.equal(prettyUptime("2026-10-12T19:29:12.000Z", NOW), "48s");
  assert.equal(prettyUptime("2026-10-12T19:05:00.000Z", NOW), "25m");
  assert.equal(prettyUptime("2026-10-12T17:25:00.000Z", NOW), "2h 05m");
  assert.equal(prettyUptime("2026-10-09T15:00:00.000Z", NOW), "3d 4h");
  assert.equal(shortHash("a".repeat(64)).length, 16);
});

test("revenue is the sum of charges in Stripe's ledger, nothing else", () => {
  const page = parseBalanceTransactions({
    object: "list",
    has_more: true,
    data: [
      { id: "txn_1", type: "charge", amount: 500, fee: 45, net: 455, status: "available" },
      { id: "txn_2", type: "payment", amount: 1000, fee: 59, net: 941, status: "pending" },
      { id: "txn_3", type: "refund", amount: -500, fee: -45, net: -455 },
      { id: "txn_4", type: "payout", amount: -1396, fee: 0, net: -1396 },
      { id: "txn_5", type: "stripe_fee", amount: -200, fee: 0, net: -200 },
      { nope: true },
    ],
  })!;
  assert.equal(page.data.length, 5);
  assert.equal(page.hasMore, true);
  assert.equal(page.lastId, "txn_5");
  assert.deepEqual(sumCharges(page.data), { gross: 1500, fees: 104, net: 1396, count: 2 });
  assert.equal(parseBalanceTransactions({ error: {} }), null);
  assert.equal(parseBalanceTransactions(null), null);
});

test("the printed tape carries no titles", () => {
  const t: Tape = {
    asOf: NOW.toISOString(),
    vends: { today: 2, total: 9, bytes: 123456789 },
    days: lastDays([{ day: "2026-10-12", vends: 2 }], NOW, 14),
    coins: { purchased: 5, promo: 3, vended: 9, returned: 1, refunded: 0 },
    money: { gross: 500, fees: 45, net: 455, count: 1, mode: "test" },
    machines: [{ name: "lantern", since: "2026-10-12T00:05:00.000Z", lastSeen: NOW.toISOString(), vends: 4, on: true }],
    recent: [{ at: "2026-10-12T19:03:01.000Z", provider: "youtube", quality: "360", bytes: 9094158, sha256: "6c77b6466ee2125ef7e2a0657c41d050ad02deb68a0131fa8d25b82b3ef0b249", machine: "mantis" }],
  };
  const lines = printTape(t);
  for (const l of lines) assert.ok(l.length <= 40, `too wide: ${JSON.stringify(l)}`);
  assert.ok(lines.some((l) => l.includes("gross (sandbox)") && l.includes("$5.00")));
  assert.ok(lines.some((l) => l.includes("lantern") && l.includes("19h 25m")));
  assert.ok(lines.some((l) => l.includes("youtube") && l.includes("6c77b6466ee2125e")));
  assert.ok(!JSON.stringify(lines).includes("Rick"), "no titles on the tape, ever");

  const off = printTape({ ...t, money: { gross: 0, fees: 0, net: 0, count: 0, mode: "off" }, machines: [{ ...t.machines[0], on: false, lastSeen: "2026-10-12T19:13:00.000Z" }] });
  assert.ok(off.some((l) => l.includes("gross") && l.includes("no stripe key")));
  assert.ok(off.some((l) => l.includes("lantern") && l.includes("off · seen 10-12 19:13")));
  assert.ok(printTape({ ...t, money: null }).some((l) => l.includes("stripe unread")));
});
