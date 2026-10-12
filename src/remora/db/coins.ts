/**
 * Cards and the ledger, as statements. The arithmetic is in core/coins.ts; this file
 * only moves rows. Idempotency lives in the schema (unique partial indexes and the
 * Stripe event table), so a webhook delivered twice, or a retried request, credits once.
 *
 * I/O edge.
 */
import { randomBytes } from "node:crypto";
import { sql } from "./client.ts";
import { newId, type JobRow, toJob } from "./queue.ts";
import type { Job } from "../core/job.ts";
import type { Quality } from "../core/format.ts";
import type { Provider } from "../core/url.ts";
import { cardIdFromHash, coinsFor, hashCardCode, newCardCode, PROMO_COINS, VEND_COINS, type LedgerEntry, type LedgerKind } from "../core/coins.ts";
import type { CompletedPurchase } from "../core/stripe.ts";

export type Card = { id: string; email: string | null; createdAt: string };

/** How many cards one address may take in a day: the promo coin's only guard. */
export const CARDS_PER_IP_PER_DAY = 3;

function ledgerId(): string {
  return `l_${randomBytes(12).toString("base64url")}`;
}

/**
 * Mint a card with its promo coin. Returns the bearer code exactly once; only its hash
 * is stored. Null when this address has taken its share today.
 */
export async function createCard(ip: string | null): Promise<{ code: string; card: Card; coins: number } | null> {
  if (ip) {
    const recent = (await sql()`
      SELECT count(*)::int AS n FROM remora_cards WHERE created_ip = ${ip} AND created_at > now() - interval '1 day'`) as { n: number }[];
    if (recent[0].n >= CARDS_PER_IP_PER_DAY) return null;
  }
  const code = newCardCode();
  const hash = hashCardCode(code);
  const id = cardIdFromHash(hash);
  const rows = (await sql()`
    INSERT INTO remora_cards (id, code_hash, created_ip) VALUES (${id}, ${hash}, ${ip})
    RETURNING id, email, created_at`) as { id: string; email: string | null; created_at: string | Date }[];
  await sql()`
    INSERT INTO remora_ledger (id, card_id, kind, coins) VALUES (${ledgerId()}, ${id}, 'promo', ${coinsFor("promo", PROMO_COINS)})`;
  return { code, card: toCard(rows[0]), coins: PROMO_COINS };
}

function toCard(r: { id: string; email: string | null; created_at: string | Date }): Card {
  return { id: r.id, email: r.email, createdAt: new Date(r.created_at).toISOString() };
}

/** The card behind a bearer code, or null. Constant work regardless of outcome. */
export async function cardByCode(code: string): Promise<Card | null> {
  const rows = (await sql()`SELECT id, email, created_at FROM remora_cards WHERE code_hash = ${hashCardCode(code)}`) as
    { id: string; email: string | null; created_at: string | Date }[];
  return rows[0] ? toCard(rows[0]) : null;
}

export async function cardById(id: string): Promise<Card | null> {
  const rows = (await sql()`SELECT id, email, created_at FROM remora_cards WHERE id = ${id}`) as
    { id: string; email: string | null; created_at: string | Date }[];
  return rows[0] ? toCard(rows[0]) : null;
}

/** SUM(coins). The only place a balance comes from. */
export async function balanceOf(cardId: string): Promise<number> {
  const rows = (await sql()`SELECT COALESCE(SUM(coins), 0)::int AS n FROM remora_ledger WHERE card_id = ${cardId}`) as { n: number }[];
  return rows[0].n;
}

export async function ledgerOf(cardId: string, limit = 50): Promise<LedgerEntry[]> {
  const rows = (await sql()`
    SELECT id, card_id, kind, coins, stripe_ref, job_id, created_at FROM remora_ledger
     WHERE card_id = ${cardId} ORDER BY created_at DESC LIMIT ${limit}`) as
    { id: string; card_id: string; kind: LedgerKind; coins: number; stripe_ref: string | null; job_id: string | null; created_at: string | Date }[];
  return rows.map((r) => ({ id: r.id, cardId: r.card_id, kind: r.kind, coins: r.coins, stripeRef: r.stripe_ref, jobId: r.job_id, createdAt: new Date(r.created_at).toISOString() }));
}

/**
 * Spend one coin and put the job in, atomically: the vend row is only written when the
 * balance covers it, and the job is only written when the vend row was. An advisory
 * lock on the card keeps two simultaneous presses from both passing the balance check.
 */
export async function enqueueWithCoin(i: { cardId: string; input: string; canonicalUrl: string; provider: Provider; quality: Quality }): Promise<Job | null> {
  const jobId = newId("j");
  const rows = (await sql()`
    WITH locked AS (
      SELECT pg_advisory_xact_lock(hashtext(${i.cardId})) AS ok
    ),
    bal AS (
      SELECT COALESCE(SUM(coins), 0) AS n FROM remora_ledger, locked WHERE card_id = ${i.cardId}
    ),
    job AS (
      INSERT INTO remora_jobs (id, input, canonical_url, provider, quality, card_id)
      SELECT ${jobId}, ${i.input}, ${i.canonicalUrl}, ${i.provider}, ${i.quality}, ${i.cardId}
        FROM bal WHERE bal.n >= ${VEND_COINS}
      RETURNING *
    ),
    spent AS (
      INSERT INTO remora_ledger (id, card_id, kind, coins, job_id)
      SELECT ${ledgerId()}, ${i.cardId}, 'vend', ${coinsFor("vend", VEND_COINS)}, job.id FROM job
      RETURNING job_id
    )
    SELECT job.* FROM job, spent`) as JobRow[];
  return rows[0] ? toJob(rows[0]) : null;
}

/**
 * Credit a paid Checkout session. The event id is the idempotency key; the purchase's
 * stripe_ref is a second one in the schema. "duplicate" means already credited.
 */
export async function recordPurchase(p: CompletedPurchase): Promise<"credited" | "duplicate" | "no-such-card"> {
  const seen = (await sql()`
    INSERT INTO remora_stripe_events (id, type) VALUES (${p.eventId}, 'checkout.session.completed')
    ON CONFLICT (id) DO NOTHING RETURNING id`) as { id: string }[];
  if (seen.length === 0) return "duplicate";
  const card = await cardById(p.cardId);
  if (!card) return "no-such-card";
  const ref = p.paymentIntent ?? p.sessionId;
  await sql()`
    INSERT INTO remora_ledger (id, card_id, kind, coins, stripe_ref) VALUES (${ledgerId()}, ${p.cardId}, 'purchase', ${coinsFor("purchase", p.coins)}, ${ref})
    ON CONFLICT DO NOTHING`;
  if (p.email && !card.email) {
    await sql()`UPDATE remora_cards SET email = ${p.email} WHERE id = ${p.cardId} AND email IS NULL`;
  }
  return "credited";
}

/** A failed carded job gets its coin back, once. Safe to call for any job. */
export async function returnCoin(jobId: string): Promise<boolean> {
  const rows = (await sql()`
    INSERT INTO remora_ledger (id, card_id, kind, coins, job_id)
    SELECT ${ledgerId()}, card_id, 'coin_return', ${coinsFor("coin_return", VEND_COINS)}, id
      FROM remora_jobs WHERE id = ${jobId} AND status = 'failed' AND card_id IS NOT NULL
    ON CONFLICT DO NOTHING RETURNING id`) as { id: string }[];
  return rows.length === 1;
}

export async function listJobsForCard(cardId: string, limit = 20): Promise<Job[]> {
  const rows = (await sql()`SELECT * FROM remora_jobs WHERE card_id = ${cardId} ORDER BY created_at DESC LIMIT ${limit}`) as JobRow[];
  return rows.map(toJob);
}
