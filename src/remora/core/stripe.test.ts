import { test } from "node:test";
import assert from "node:assert/strict";
import { checkoutSessionBody, completedPurchase, formEncode, signWebhook, verifyWebhook, WEBHOOK_TOLERANCE_S } from "./stripe.ts";
import { sleeve } from "./coins.ts";

const NOW = new Date("2026-10-11T20:00:00.000Z");
const SECRET = "whsec_test_secret";

test("checkout body: inline price by default, a dashboard price when given", () => {
  const base = { sleeve: sleeve(5)!, cardId: "card_abc", successUrl: "https://squaloo.com/remora?paid=1", cancelUrl: "https://squaloo.com/remora" };
  const inline = Object.fromEntries(checkoutSessionBody(base));
  assert.equal(inline["mode"], "payment");
  assert.equal(inline["line_items[0][price_data][unit_amount]"], "500");
  assert.equal(inline["line_items[0][price_data][currency]"], "usd");
  assert.equal(inline["metadata[card_id]"], "card_abc");
  assert.equal(inline["metadata[coins]"], "5");
  assert.equal(inline["automatic_tax[enabled]"], undefined);

  const priced = Object.fromEntries(checkoutSessionBody({ ...base, priceId: "price_123", automaticTax: true, email: "a@b.c" }));
  assert.equal(priced["line_items[0][price]"], "price_123");
  assert.equal(priced["line_items[0][price_data][unit_amount]"], undefined);
  assert.equal(priced["automatic_tax[enabled]"], "true");
  assert.equal(priced["customer_email"], "a@b.c");

  assert.match(formEncode([["a[b]", "x y"]]), /^a%5Bb%5D=x%20y$/);
});

test("webhook signature: Stripe's scheme, round-tripped", () => {
  const body = '{"id":"evt_1","type":"checkout.session.completed"}';
  const header = signWebhook(body, SECRET, NOW);
  assert.match(header, /^t=\d+,v1=[0-9a-f]{64}$/);
  assert.deepEqual(verifyWebhook(body, header, SECRET, NOW), { ok: true });
  assert.deepEqual(verifyWebhook(body, header, SECRET, new Date(NOW.getTime() + (WEBHOOK_TOLERANCE_S - 1) * 1000)), { ok: true });
  assert.equal(verifyWebhook(body, header, SECRET, new Date(NOW.getTime() + (WEBHOOK_TOLERANCE_S + 1) * 1000)).ok, false, "replayed later");
  assert.equal(verifyWebhook(body + " ", header, SECRET, NOW).ok, false, "body changed");
  assert.equal(verifyWebhook(body, header, "whsec_other", NOW).ok, false, "wrong secret");
  assert.equal(verifyWebhook(body, null, SECRET, NOW).ok, false);
  assert.equal(verifyWebhook(body, "t=abc,v1=00", SECRET, NOW).ok, false);
  assert.equal(verifyWebhook(body, "v1=00", SECRET, NOW).ok, false);
  // a rotated secret: one of several v1 values matching is enough
  const rotated = `${header},v1=${"0".repeat(64)}`;
  assert.deepEqual(verifyWebhook(body, rotated, SECRET, NOW), { ok: true });
});

test("a completed, paid session with our metadata becomes a purchase", () => {
  const event = {
    id: "evt_1",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_1",
        object: "checkout.session",
        payment_status: "paid",
        payment_intent: "pi_1",
        amount_total: 500,
        metadata: { card_id: "card_abc", coins: "5" },
        customer_details: { email: "a@b.c" },
      },
    },
  };
  assert.deepEqual(completedPurchase(event), {
    eventId: "evt_1",
    sessionId: "cs_test_1",
    paymentIntent: "pi_1",
    cardId: "card_abc",
    coins: 5,
    amountCents: 500,
    email: "a@b.c",
  });
  assert.equal(completedPurchase({ ...event, type: "payment_intent.succeeded" }), null);
  assert.equal(completedPurchase({ ...event, data: { object: { ...event.data.object, payment_status: "unpaid" } } }), null);
  assert.equal(completedPurchase({ ...event, data: { object: { ...event.data.object, metadata: {} } } }), null);
  assert.equal(completedPurchase({ ...event, data: { object: { ...event.data.object, metadata: { card_id: "x", coins: "0" } } } }), null);
  assert.equal(completedPurchase(null), null);
});
