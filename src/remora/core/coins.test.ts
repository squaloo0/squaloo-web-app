import { test } from "node:test";
import assert from "node:assert/strict";
import { balance, BASE_COINS, cardIdFromHash, coinsFor, feeCents, hashCardCode, isCardCode, newCardCode, prettyCoins, PRICE_LIST, shortReason, sleeve, SLEEVES, vendCoins } from "./coins.ts";
import { QUALITIES } from "./format.ts";

test("sleeves: fee math is why they exist", () => {
  assert.equal(SLEEVES.length, 3);
  assert.equal(sleeve(5)?.cents, 500);
  assert.equal(sleeve("12")?.cents, 1000);
  assert.equal(sleeve(7), null);
  // a $1 coin would lose a third; a $5 sleeve loses under 9%
  assert.equal(feeCents(100), 33);
  assert.equal(feeCents(500), 45);
  assert.ok(feeCents(500) / 500 <= 0.09);
});

test("a balance is a sum and signs are fixed by kind", () => {
  const rows = [
    { coins: coinsFor("promo", 1) },
    { coins: coinsFor("purchase", 5) },
    { coins: coinsFor("vend", 1) },
    { coins: coinsFor("vend", -1) }, // sign is not the caller's to choose
    { coins: coinsFor("coin_return", 1) },
    { coins: coinsFor("refund", 5) },
  ];
  assert.deepEqual(
    rows.map((r) => r.coins),
    [1, 5, -1, -1, 1, -5],
  );
  assert.equal(balance(rows), 0);
  assert.equal(balance([]), 0);
});

test("card codes are long, hashed, and never the handle", () => {
  const code = newCardCode();
  assert.ok(isCardCode(code), code);
  assert.notEqual(newCardCode(), code);
  assert.equal(isCardCode("rc_short"), false);
  assert.equal(isCardCode(42), false);
  const h = hashCardCode(code);
  assert.match(h, /^[0-9a-f]{64}$/);
  assert.equal(hashCardCode(code), h, "deterministic");
  const id = cardIdFromHash(h);
  assert.match(id, /^card_[0-9a-f]{12}$/);
  assert.equal(id.includes(code.slice(3, 10)), false, "the id reveals nothing of the code");
});

test("pretty coins", () => {
  assert.equal(prettyCoins(0), "no coins");
  assert.equal(prettyCoins(1), "1 coin");
  assert.equal(prettyCoins(12), "12 coins");
});

test("the price list: one coin a slot, two for a transcript, and the 402 says both numbers", () => {
  for (const q of QUALITIES) assert.ok(vendCoins(q) >= BASE_COINS, q);
  assert.equal(vendCoins("360"), 1);
  assert.equal(vendCoins("chapters"), 1);
  assert.equal(vendCoins("transcript"), 2);
  assert.deepEqual(Object.keys(PRICE_LIST), ["transcript"], "every priced slot is named here so the panel and the 402 cannot drift");
  assert.equal(shortReason("transcript", 1), "2 coins for a transcript · 1 coin on the card");
  assert.equal(shortReason("720", 0), "1 coin for this slot · no coins on the card");
});
