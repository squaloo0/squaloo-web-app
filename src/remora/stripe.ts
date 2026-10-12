/**
 * The one call the machine makes to Stripe: open a Checkout session for a sleeve.
 * Everything else (the body, the webhook check) is pure in core/stripe.ts.
 *
 * I/O edge. Env:
 *   STRIPE_SECRET_KEY          sk_test_… until the paperwork exists, then sk_live_…
 *   STRIPE_WEBHOOK_SECRET      whsec_… for /api/remora/stripe
 *   REMORA_STRIPE_PRICE_5|12|30   optional dashboard price ids; else inline prices
 *   REMORA_STRIPE_TAX=1        enable Stripe Tax on sessions (not needed under Managed Payments)
 *   REMORA_STRIPE_TAX_CODE     product tax code for inline prices; default txcd_10000000
 */
import { checkoutSessionBody, formEncode, type CheckoutInput } from "./core/stripe.ts";
import type { Sleeve } from "./core/coins.ts";
import { parseBalanceTransactions, sumCharges, type BalanceTransaction, type Money } from "./core/tape.ts";

export class StripeError extends Error {
  readonly status: number | null;
  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "StripeError";
    this.status = status;
  }
}

/** Dashboards store a pasted value literally; forgive surrounding quotes and whitespace. */
function env(name: string): string | null {
  const v = (process.env[name] ?? "").trim().replace(/^["']|["']$/g, "");
  return v.length > 0 ? v : null;
}

export function stripeSecretKey(): string | null {
  return env("STRIPE_SECRET_KEY");
}

export function stripeWebhookSecret(): string | null {
  return env("STRIPE_WEBHOOK_SECRET");
}

export function stripeWired(): boolean {
  return Boolean(stripeSecretKey() && stripeWebhookSecret());
}

export function stripeMode(): "test" | "live" | "off" {
  const k = stripeSecretKey() ?? "";
  return k.startsWith("sk_live_") ? "live" : k.startsWith("sk_test_") ? "test" : "off";
}

export function priceIdFor(sleeve: Sleeve): string | null {
  return process.env[`REMORA_STRIPE_PRICE_${sleeve.coins}`] || null;
}

export type CheckoutSession = { id: string; url: string };

export async function createCheckoutSession(i: Omit<CheckoutInput, "priceId" | "automaticTax">): Promise<CheckoutSession> {
  const key = stripeSecretKey();
  if (!key) throw new StripeError("STRIPE_SECRET_KEY is not set; the coin slot is closed");
  const body = formEncode(
    checkoutSessionBody({
      ...i,
      priceId: priceIdFor(i.sleeve),
      automaticTax: process.env.REMORA_STRIPE_TAX === "1",
      taxCode: env("REMORA_STRIPE_TAX_CODE") ?? undefined,
    }),
  );
  let res: Response;
  try {
    res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      // No Stripe-Version pin: the account's default (2025-03-31.basil or newer on an
      // account opened in 2026) is what Managed Payments requires. Pinning older broke it.
      headers: { authorization: `Bearer ${key}`, "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(15_000),
    });
  } catch (e) {
    throw new StripeError(`Stripe unreachable: ${e instanceof Error ? e.message : String(e)}`, null);
  }
  const json = (await res.json().catch(() => ({}))) as { id?: string; url?: string; error?: { message?: string; type?: string; code?: string } };
  if (!res.ok || !json.id || !json.url) {
    const why = json.error?.message ?? "no session in the reply";
    throw new StripeError(`Stripe said ${res.status}${json.error?.code ? ` (${json.error.code})` : ""}: ${why}`, res.status);
  }
  return { id: json.id, url: json.url };
}

/**
 * Revenue to date from Stripe's own ledger: every charge in balance_transactions, gross,
 * fees, net. Paginates; capped at 20 pages (2000 charges) which is years away. Null
 * when there is no key. Mode is the key's mode so the tape can say "sandbox".
 */
export async function revenueToDate(): Promise<Money | null> {
  const key = stripeSecretKey();
  if (!key) return null;
  const all: BalanceTransaction[] = [];
  let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const u = new URL("https://api.stripe.com/v1/balance_transactions");
    u.searchParams.set("limit", "100");
    if (after) u.searchParams.set("starting_after", after);
    const res = await fetch(u, { headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new StripeError(`Stripe said ${res.status} listing balance transactions`, res.status);
    const parsed = parseBalanceTransactions(await res.json());
    if (!parsed) throw new StripeError("Stripe's balance_transactions did not parse");
    all.push(...parsed.data);
    if (!parsed.hasMore || !parsed.lastId) break;
    after = parsed.lastId;
  }
  return { ...sumCharges(all), mode: stripeMode() };
}
