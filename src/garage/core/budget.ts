/**
 * Guard 2: $2 per run, $10 per day. The day cap is checked before launch; the run cap is
 * handed to the harness as the hard stop for the query. Both numbers live here and nowhere
 * else. Pure.
 */
export const PER_RUN_USD = 2;
export const PER_DAY_USD = 10;

export type BudgetInput = {
  /** Sum of cost_usd over the runs that started today (UTC). */
  spentTodayUsd: number;
  perRunUsd?: number;
  perDayUsd?: number;
};

export type BudgetVerdict = { ok: true; capUsd: number } | { ok: false; reason: string };

/** What this run may spend, or why it may not start. */
export function budgetBeforeLaunch(b: BudgetInput): BudgetVerdict {
  const perRun = b.perRunUsd ?? PER_RUN_USD;
  const perDay = b.perDayUsd ?? PER_DAY_USD;
  const left = round(perDay - b.spentTodayUsd);
  if (left <= 0) {
    return { ok: false, reason: `day budget spent: $${round(b.spentTodayUsd).toFixed(2)} of $${perDay.toFixed(2)}` };
  }
  return { ok: true, capUsd: Math.min(perRun, left) };
}

export function round(usd: number): number {
  return Math.round(usd * 10000) / 10000;
}

export function prettyUsd(usd: number): string {
  return `$${usd.toFixed(usd < 0.1 && usd > 0 ? 3 : 2)}`;
}
