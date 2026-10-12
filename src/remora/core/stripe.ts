/**
 * The two things the machine says to Stripe, and the one thing Stripe says back.
 *
 *   checkoutSessionBody()   the form body for POST /v1/checkout/sessions
 *   verifyWebhook()         Stripe-Signature over the raw body, HMAC-SHA256, 5 min tolerance
 *   completedPurchase()     narrow a checkout.session.completed event to what the ledger needs
 *
 * No `stripe` package: Checkout is one form POST and the webhook check is one HMAC.
 * Pure; keys and time are inputs. The fetch lives in ../stripe.ts.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { type Sleeve } from "./coins.ts";

export type CheckoutInput = {
  sleeve: Sleeve;
  cardId: string;
  successUrl: string;
  cancelUrl: string;
  /** A Stripe price id for this sleeve, when one is defined in the dashboard; else inline. */
  priceId?: string | null;
  /** Stripe Tax, when the account has it switched on. */
  automaticTax?: boolean;
  /** Prefill the email box when the card already has one. */
  email?: string | null;
};

/** Form-encoded body for POST /v1/checkout/sessions, as an ordered list of pairs. */
export function checkoutSessionBody(i: CheckoutInput): [string, string][] {
  const pairs: [string, string][] = [
    ["mode", "payment"],
    ["success_url", i.successUrl],
    ["cancel_url", i.cancelUrl],
    ["line_items[0][quantity]", "1"],
    ["metadata[card_id]", i.cardId],
    ["metadata[coins]", String(i.sleeve.coins)],
    ["payment_intent_data[description]", `Remora: ${i.sleeve.name}`],
  ];
  if (i.priceId) {
    pairs.push(["line_items[0][price]", i.priceId]);
  } else {
    pairs.push(
      ["line_items[0][price_data][currency]", "usd"],
      ["line_items[0][price_data][unit_amount]", String(i.sleeve.cents)],
      ["line_items[0][price_data][product_data][name]", i.sleeve.name],
      ["line_items[0][price_data][product_data][description]", `${i.sleeve.coins} vends on the Remora video vending machine. Digital goods, delivered on the spot.`],
    );
  }
  if (i.automaticTax) pairs.push(["automatic_tax[enabled]", "true"]);
  if (i.email) pairs.push(["customer_email", i.email]);
  return pairs;
}

export function formEncode(pairs: [string, string][]): string {
  return pairs.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}

export const WEBHOOK_TOLERANCE_S = 300;

/**
 * Stripe-Signature: "t=<unix>,v1=<hex>[,v1=<hex>...]". The signed payload is
 * "<t>.<raw body>". Any v1 matching counts (Stripe rotates secrets with overlap).
 */
export function verifyWebhook(rawBody: string, header: string | null, secret: string, now: Date): { ok: true } | { ok: false; reason: string } {
  if (!header) return { ok: false, reason: "no Stripe-Signature header" };
  let t: number | null = null;
  const v1: string[] = [];
  for (const part of header.split(",")) {
    const [k, v] = part.trim().split("=", 2);
    if (k === "t") t = Number(v);
    if (k === "v1" && v) v1.push(v);
  }
  if (t === null || !Number.isFinite(t)) return { ok: false, reason: "no timestamp" };
  if (v1.length === 0) return { ok: false, reason: "no v1 signature" };
  if (Math.abs(now.getTime() / 1000 - t) > WEBHOOK_TOLERANCE_S) return { ok: false, reason: "timestamp outside tolerance" };
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`, "utf8").digest("hex");
  const e = Buffer.from(expected, "utf8");
  const match = v1.some((s) => {
    const b = Buffer.from(s, "utf8");
    return b.length === e.length && timingSafeEqual(b, e);
  });
  return match ? { ok: true } : { ok: false, reason: "signature mismatch" };
}

/** What Stripe would have sent, for tests and for `remora stripe-sign`. */
export function signWebhook(rawBody: string, secret: string, now: Date): string {
  const t = Math.floor(now.getTime() / 1000);
  const v1 = createHmac("sha256", secret).update(`${t}.${rawBody}`, "utf8").digest("hex");
  return `t=${t},v1=${v1}`;
}

export type CompletedPurchase = {
  eventId: string;
  sessionId: string;
  paymentIntent: string | null;
  cardId: string;
  coins: number;
  amountCents: number | null;
  email: string | null;
};

/**
 * Narrow a webhook event. Null for anything that is not a paid, completed Checkout
 * session carrying our metadata; the caller acknowledges those and moves on.
 */
export function completedPurchase(event: unknown): CompletedPurchase | null {
  if (typeof event !== "object" || event === null) return null;
  const e = event as Record<string, unknown>;
  if (e.type !== "checkout.session.completed" || typeof e.id !== "string") return null;
  const data = (e.data as Record<string, unknown> | undefined)?.object as Record<string, unknown> | undefined;
  if (!data || typeof data.id !== "string") return null;
  if (data.payment_status !== "paid") return null;
  const meta = (data.metadata ?? {}) as Record<string, unknown>;
  const cardId = typeof meta.card_id === "string" ? meta.card_id : null;
  const coins = Number(meta.coins);
  if (!cardId || !Number.isInteger(coins) || coins <= 0) return null;
  const details = (data.customer_details ?? {}) as Record<string, unknown>;
  return {
    eventId: e.id,
    sessionId: data.id,
    paymentIntent: typeof data.payment_intent === "string" ? data.payment_intent : null,
    cardId,
    coins,
    amountCents: typeof data.amount_total === "number" ? data.amount_total : null,
    email: typeof details.email === "string" ? details.email : null,
  };
}
