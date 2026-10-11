/**
 * The one call the machine makes to Stripe: open a Checkout session for a sleeve.
 * Everything else (the body, the webhook check) is pure in core/stripe.ts.
 *
 * I/O edge. Env:
 *   STRIPE_SECRET_KEY          sk_test_… until the paperwork exists, then sk_live_…
 *   STRIPE_WEBHOOK_SECRET      whsec_… for /api/remora/stripe
 *   REMORA_STRIPE_PRICE_5|12|30   optional dashboard price ids; else inline prices
 *   REMORA_STRIPE_TAX=1        enable Stripe Tax on sessions (the account must have it on)
 */
import { checkoutSessionBody, formEncode, type CheckoutInput } from "./core/stripe.ts";
import type { Sleeve } from "./core/coins.ts";

export class StripeError extends Error {
  readonly status: number | null;
  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "StripeError";
    this.status = status;
  }
}

export function stripeWired(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

export function stripeMode(): "test" | "live" | "off" {
  const k = process.env.STRIPE_SECRET_KEY ?? "";
  return k.startsWith("sk_live_") ? "live" : k.startsWith("sk_test_") ? "test" : "off";
}

export function priceIdFor(sleeve: Sleeve): string | null {
  return process.env[`REMORA_STRIPE_PRICE_${sleeve.coins}`] || null;
}

export type CheckoutSession = { id: string; url: string };

export async function createCheckoutSession(i: Omit<CheckoutInput, "priceId" | "automaticTax">): Promise<CheckoutSession> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeError("STRIPE_SECRET_KEY is not set; the coin slot is closed");
  const body = formEncode(
    checkoutSessionBody({ ...i, priceId: priceIdFor(i.sleeve), automaticTax: process.env.REMORA_STRIPE_TAX === "1" }),
  );
  let res: Response;
  try {
    res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/x-www-form-urlencoded", "stripe-version": "2024-06-20" },
      body,
      signal: AbortSignal.timeout(15_000),
    });
  } catch (e) {
    throw new StripeError(`Stripe unreachable: ${e instanceof Error ? e.message : String(e)}`);
  }
  const json = (await res.json().catch(() => ({}))) as { id?: string; url?: string; error?: { message?: string } };
  if (!res.ok || !json.id || !json.url) {
    throw new StripeError(`Stripe said ${res.status}: ${json.error?.message ?? "no session"}`, res.status);
  }
  return { id: json.id, url: json.url };
}
