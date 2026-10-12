/**
 * POST /api/remora/stripe   Stripe's webhook. The only thing that ever credits coins.
 *
 * Signature over the raw body with STRIPE_WEBHOOK_SECRET; the event id is the
 * idempotency key; anything that is not a paid checkout.session.completed with our
 * metadata is acknowledged and ignored.
 */
import { NextResponse } from "next/server";
import { completedPurchase, verifyWebhook } from "@/remora/core/stripe";
import { stripeWebhookSecret } from "@/remora/stripe";
import { dbWired } from "@/remora/db/client";
import { recordPurchase } from "@/remora/db/coins";

export async function POST(req: Request): Promise<NextResponse> {
  const secret = stripeWebhookSecret();
  if (!secret) return NextResponse.json({ error: "no webhook secret on this deploy" }, { status: 503 });
  if (!dbWired()) return NextResponse.json({ error: "no queue wired on this deploy" }, { status: 503 });

  const raw = await req.text();
  const check = verifyWebhook(raw, req.headers.get("stripe-signature"), secret, new Date());
  if (!check.ok) return NextResponse.json({ error: `bad signature: ${check.reason}` }, { status: 400 });

  let event: unknown;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "not JSON" }, { status: 400 });
  }
  const purchase = completedPurchase(event);
  if (!purchase) return NextResponse.json({ received: true, acted: false });

  const outcome = await recordPurchase(purchase);
  return NextResponse.json({ received: true, acted: outcome === "credited", outcome, card: purchase.cardId, coins: purchase.coins });
}
