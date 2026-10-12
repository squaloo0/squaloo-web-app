/**
 * The tape's numbers, as aggregates. Nothing here returns a title, a URL or a card.
 * I/O edge.
 */
import { sql } from "./client.ts";
import { MACHINE_SILENT_AFTER_MS } from "../core/job.ts";
import { lastDays, type CoinTotals, type DayCount, type Drop, type Tape } from "../core/tape.ts";

export async function tapeNumbers(now = new Date()): Promise<Omit<Tape, "money" | "asOf">> {
  const [[totals], days, coins, machines, recent] = await Promise.all([
    (sql()`
      SELECT count(*)::int AS total,
             count(*) FILTER (WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'utc') AT TIME ZONE 'utc')::int AS today,
             COALESCE(SUM(bytes), 0)::bigint AS bytes
        FROM remora_assets WHERE kind IN ('video', 'audio')` as unknown) as Promise<{ total: number; today: number; bytes: string | number }[]>,
    (sql()`
      SELECT to_char(created_at AT TIME ZONE 'utc', 'YYYY-MM-DD') AS day, count(*)::int AS vends
        FROM remora_assets WHERE kind IN ('video', 'audio') AND created_at > now() - interval '15 days'
       GROUP BY 1` as unknown) as Promise<DayCount[]>,
    (sql()`SELECT kind, COALESCE(SUM(ABS(coins)), 0)::int AS n FROM remora_ledger GROUP BY kind` as unknown) as Promise<{ kind: string; n: number }[]>,
    (sql()`SELECT name, started_at, last_seen, vends FROM remora_machine ORDER BY last_seen DESC` as unknown) as Promise<
      { name: string; started_at: string | Date; last_seen: string | Date; vends: number }[]
    >,
    (sql()`
      SELECT a.created_at, j.provider, j.quality, a.bytes, a.sha256, j.claimed_by, a.job_id
        FROM remora_assets a JOIN remora_jobs j ON j.id = a.job_id
       WHERE a.kind IN ('video', 'audio')
       ORDER BY a.created_at DESC LIMIT 25` as unknown) as Promise<
      { created_at: string | Date; provider: string; quality: string; bytes: string | number; sha256: string; claimed_by: string | null; job_id: string }[]
    >,
  ]);

  const byKind = Object.fromEntries(coins.map((c) => [c.kind, c.n]));
  const coinTotals: CoinTotals = {
    purchased: byKind.purchase ?? 0,
    promo: byKind.promo ?? 0,
    vended: byKind.vend ?? 0,
    returned: byKind.coin_return ?? 0,
    refunded: byKind.refund ?? 0,
  };

  return {
    vends: { today: totals?.today ?? 0, total: totals?.total ?? 0, bytes: Number(totals?.bytes ?? 0) },
    days: lastDays(days, now, 14),
    coins: coinTotals,
    machines: machines.map((m) => ({
      name: m.name,
      since: new Date(m.started_at).toISOString(),
      lastSeen: new Date(m.last_seen).toISOString(),
      vends: m.vends,
      on: now.getTime() - new Date(m.last_seen).getTime() <= MACHINE_SILENT_AFTER_MS,
    })),
    recent: recent.map(
      (r): Drop => ({
        at: new Date(r.created_at).toISOString(),
        provider: r.provider,
        quality: r.quality,
        bytes: Number(r.bytes),
        sha256: r.sha256,
        // claimed_by is cleared on completion; the machine that vended is on the receipt,
        // and the tape only needs a name when one is still attached.
        machine: r.claimed_by,
      }),
    ),
  };
}
