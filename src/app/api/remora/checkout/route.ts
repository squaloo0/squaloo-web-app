/**
 * POST /api/remora/checkout   form or JSON { sleeve: 5 | 12 | 30 }  → 303 to Stripe Checkout
 *
 * Needs a card in the slot (take one first; the webhook credits that card). Nothing is
 * credited here or on the way back from Stripe; only the webhook writes the ledger.
 */
import { NextResponse } from "next/server";
import { sleeve } from "@/remora/core/coins";
import { createCheckoutSession, StripeError, stripeWired } from "@/remora/stripe";
import { visitor } from "@/remora/card";

export async function POST(req: Request): Promise<NextResponse> {
  const isForm = (req.headers.get("content-type") ?? "").includes("form");
  const back = (q: string) => NextResponse.redirect(new URL(`/remora${q}`, req.url), { status: 303 });
  const fail = (q: string, error: string, status: number) => (isForm ? back(q) : NextResponse.json({ error }, { status }));

  const v = await visitor();
  if (v.kind !== "card") return fail("?coin=no-card", "take a card first", 401);
  if (!stripeWired()) return fail("?coin=slot-closed", "the coin slot is closed on this deploy", 503);

  const raw = isForm ? (await req.formData()).get("sleeve") : ((await req.json().catch(() => ({}))) as { sleeve?: unknown }).sleeve;
  const s = sleeve(typeof raw === "string" || typeof raw === "number" ? raw : NaN);
  if (!s) return fail("?coin=bad-sleeve", "pick a sleeve: 5, 12 or 30", 400);

  const origin = new URL(req.url).origin;
  try {
    const session = await createCheckoutSession({
      sleeve: s,
      cardId: v.card.id,
      email: v.card.email,
      successUrl: `${origin}/remora?paid=${s.coins}`,
      cancelUrl: `${origin}/remora?coin=cancelled`,
    });
    return isForm ? NextResponse.redirect(session.url, { status: 303 }) : NextResponse.json({ url: session.url, id: session.id });
  } catch (e) {
    const message = e instanceof StripeError ? e.message : "could not open checkout";
    return fail("?coin=stripe-error", message, 502);
  }
}
