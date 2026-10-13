/**
 * Standing orders, the pure half: which orders are due now. An order is due when it is
 * enabled and either never queued or queued at least `everyHours` ago. Pure.
 */
export type Order = {
  id: number;
  hat: string;
  prompt: string | null;
  ticket: string | null;
  everyHours: number;
  enabled: boolean;
  lastQueuedAt: string | null;
  runs: number;
  createdBy: string;
  createdAt: string;
};

/** Hats a standing order may carry: the ones whose mistakes announce themselves (charter 0.4). */
export const ORDERABLE_HATS: readonly string[] = ["report", "study"];

export function isDue(o: Order, now: Date): boolean {
  if (!o.enabled) return false;
  if (!ORDERABLE_HATS.includes(o.hat)) return false;
  if (o.lastQueuedAt === null) return true;
  return now.getTime() - new Date(o.lastQueuedAt).getTime() >= o.everyHours * 3_600_000;
}

export function dueOrders(orders: Order[], now: Date): Order[] {
  return orders.filter((o) => isDue(o, now));
}

/** "every 24h · last 2026-10-13 09:00Z · 3 runs" */
export function orderLine(o: Order): string {
  return [`#${o.id}`, o.hat + (o.ticket ? ` ${o.ticket}` : ""), `every ${o.everyHours}h`, o.enabled ? "on" : "off", o.lastQueuedAt ? `last ${o.lastQueuedAt.slice(0, 16).replace("T", " ")}Z` : "never queued", `${o.runs} run${o.runs === 1 ? "" : "s"}`].join(" · ");
}

export function parseEveryHours(v: string | null | undefined): number | null {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > 24 * 14) return null;
  return n;
}
