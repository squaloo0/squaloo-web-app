/**
 * The tape: the machine's open books, as arithmetic. Pure.
 *
 * What goes on the tape: counts, bytes, coins, money from Stripe's own ledger, uptime,
 * and a strip of recent drops identified by hash. What never goes on the tape: titles,
 * URLs, card handles. A customer's taste is theirs; the machine's numbers are public.
 */

export type DayCount = { day: string; vends: number };

export type Drop = {
  /** ISO. */
  at: string;
  provider: string;
  quality: string;
  bytes: number;
  sha256: string;
  machine: string | null;
};

export type CoinTotals = {
  purchased: number;
  promo: number;
  vended: number;
  returned: number;
  refunded: number;
};

export type Money = {
  /** Gross charged, cents, before Stripe's cut. */
  gross: number;
  /** Stripe's fees, cents. */
  fees: number;
  /** What reached the account, cents. */
  net: number;
  /** Charges counted. */
  count: number;
  /** "test" when the key is a sandbox key: the tape says so. */
  mode: "test" | "live" | "off";
};

export type Tape = {
  asOf: string;
  vends: { today: number; total: number; bytes: number };
  days: DayCount[];
  coins: CoinTotals;
  money: Money | null;
  machines: { name: string; since: string; lastSeen: string; vends: number; on: boolean }[];
  recent: Drop[];
};

/** "2026-10-12" for any instant, in UTC. The tape runs on UTC and says so. */
export function dayOf(iso: string | Date): string {
  return (typeof iso === "string" ? new Date(iso) : iso).toISOString().slice(0, 10);
}

/** The last `n` days ending today, zero-filled, oldest first. */
export function lastDays(counts: readonly DayCount[], now: Date, n = 14): DayCount[] {
  const byDay = new Map(counts.map((c) => [c.day, c.vends]));
  const out: DayCount[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86_400_000);
    const day = dayOf(d);
    out.push({ day, vends: byDay.get(day) ?? 0 });
  }
  return out;
}

const BARS = " ▁▂▃▄▅▆▇█";

/** One character per day, scaled to the busiest. "▁▃█▂    ▅" */
export function sparkline(days: readonly DayCount[]): string {
  const max = Math.max(0, ...days.map((d) => d.vends));
  if (max === 0) return " ".repeat(days.length);
  return days.map((d) => (d.vends === 0 ? " " : BARS[Math.max(1, Math.round((d.vends / max) * 8))])).join("");
}

/** 123456 → "$1,234.56". Cents in, dollars out. Negative keeps its sign. */
export function prettyMoney(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString("en-US");
  return `${sign}$${dollars}.${String(abs % 100).padStart(2, "0")}`;
}

/** "3d 4h", "2h 05m", "48s". */
export function prettyUptime(since: string, now: Date): string {
  const s = Math.max(0, Math.floor((now.getTime() - Date.parse(since)) / 1000));
  const d = Math.floor(s / 86_400);
  const h = Math.floor((s % 86_400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

/** Hashes on the tape are long enough to look up, short enough to read. */
export function shortHash(sha256: string): string {
  return sha256.slice(0, 16);
}

export type BalanceTransaction = {
  type: string;
  amount: number;
  fee: number;
  net: number;
  status?: string;
};

/**
 * Sum Stripe balance transactions of the kinds that are a customer paying. Refunds and
 * payouts are not revenue; fees are Stripe's. The result is what Stripe's ledger says,
 * which is the point: the public number is the bank's number.
 */
export function sumCharges(txs: readonly BalanceTransaction[]): Pick<Money, "gross" | "fees" | "net" | "count"> {
  let gross = 0;
  let fees = 0;
  let net = 0;
  let count = 0;
  for (const t of txs) {
    if (t.type !== "charge" && t.type !== "payment") continue;
    gross += t.amount;
    fees += t.fee;
    net += t.net;
    count++;
  }
  return { gross, fees, net, count };
}

/** Narrow one page of GET /v1/balance_transactions. */
export function parseBalanceTransactions(json: unknown): { data: BalanceTransaction[]; hasMore: boolean; lastId: string | null } | null {
  if (typeof json !== "object" || json === null) return null;
  const o = json as { data?: unknown; has_more?: unknown };
  if (!Array.isArray(o.data)) return null;
  const data: BalanceTransaction[] = [];
  let lastId: string | null = null;
  for (const raw of o.data) {
    if (typeof raw !== "object" || raw === null) continue;
    const t = raw as Record<string, unknown>;
    if (typeof t.type !== "string" || typeof t.amount !== "number" || typeof t.fee !== "number" || typeof t.net !== "number") continue;
    data.push({ type: t.type, amount: t.amount, fee: t.fee, net: t.net, status: typeof t.status === "string" ? t.status : undefined });
    if (typeof t.id === "string") lastId = t.id;
  }
  return { data, hasMore: o.has_more === true, lastId };
}

/** The tape as a thermal strip, for the CLI and for anyone who likes it that way. */
export function printTape(t: Tape): string[] {
  const W = 40;
  const rule = "-".repeat(W);
  const center = (s: string) => s.padStart(Math.floor((W + s.length) / 2)).padEnd(W);
  const kv = (k: string, v: string) => {
    const label = k.padEnd(14);
    return `${label}${v.slice(0, W - label.length).padStart(W - label.length)}`;
  };
  const lines = [
    rule,
    center("R E M O R A · T A P E"),
    center("open books, utc"),
    rule,
    kv("as of", t.asOf.replace("T", " ").slice(0, 16)),
    kv("vends today", String(t.vends.today)),
    kv("vends to date", String(t.vends.total)),
    kv("bytes vended", String(t.vends.bytes)),
    kv("14 days", `|${sparkline(t.days)}|`),
    "",
    kv("coins bought", String(t.coins.purchased)),
    kv("on the house", String(t.coins.promo)),
    kv("coins spent", String(t.coins.vended)),
    kv("coins returned", String(t.coins.returned)),
  ];
  if (t.money) {
    lines.push(
      "",
      kv(`gross${t.money.mode === "test" ? " (sandbox)" : ""}`, prettyMoney(t.money.gross)),
      kv("stripe's cut", prettyMoney(t.money.fees)),
      kv("net", prettyMoney(t.money.net)),
    );
  }
  lines.push("");
  for (const m of t.machines) {
    lines.push(kv(m.name, `${m.on ? "on" : "off"} · up ${prettyUptime(m.since, new Date(t.asOf))}`));
  }
  lines.push(rule, center("recent drops"), rule);
  for (const d of t.recent) {
    lines.push(`${d.at.slice(5, 16).replace("T", " ")} ${d.provider.slice(0, 7).padEnd(7)} ${shortHash(d.sha256)}`);
  }
  lines.push(rule, center("titles are the customer's"), center("hashes are the machine's"), rule);
  return lines;
}
