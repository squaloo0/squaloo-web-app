/**
 * Coins, sleeves, cards and the ledger's arithmetic. Pure.
 *
 * A coin is one vend of any slot. Coins are sold in sleeves because Stripe takes
 * 2.9% + 30¢ per charge and a $1 coin would lose a third of itself. A card is a long
 * random bearer code with no account behind it; the ledger is append-only and a
 * balance is a SUM, never a column.
 */
import { createHash, randomBytes } from "node:crypto";

export type Sleeve = {
  /** Coins in the sleeve. Also the sleeve's id in env and in Stripe metadata. */
  coins: number;
  /** Price in cents. */
  cents: number;
  name: string;
};

export const SLEEVES: readonly Sleeve[] = [
  { coins: 5, cents: 500, name: "Sleeve of 5 coins" },
  { coins: 12, cents: 1000, name: "Sleeve of 12 coins" },
  { coins: 30, cents: 2000, name: "Sleeve of 30 coins" },
];

export function sleeve(coins: number | string): Sleeve | null {
  const n = Number(coins);
  return SLEEVES.find((s) => s.coins === n) ?? null;
}

/** Stripe's cut on a sleeve, for the honest line under each price. */
export function feeCents(cents: number): number {
  return Math.round(cents * 0.029 + 30);
}

export type LedgerKind = "purchase" | "vend" | "coin_return" | "refund" | "promo";
export const LEDGER_KINDS: readonly LedgerKind[] = ["purchase", "vend", "coin_return", "refund", "promo"];

export type LedgerEntry = {
  id: string;
  cardId: string;
  kind: LedgerKind;
  /** Signed: purchases and promos are positive, vends and refunds negative, returns positive. */
  coins: number;
  stripeRef: string | null;
  jobId: string | null;
  createdAt: string;
};

/** The only arithmetic there is. */
export function balance(entries: readonly Pick<LedgerEntry, "coins">[]): number {
  return entries.reduce((n, e) => n + e.coins, 0);
}

/** Sign conventions, so nobody writes a negative purchase by hand. */
export function coinsFor(kind: LedgerKind, count: number): number {
  const n = Math.abs(Math.trunc(count));
  switch (kind) {
    case "purchase":
    case "promo":
    case "coin_return":
      return n;
    case "vend":
    case "refund":
      return -n;
  }
}

/** Every new card gets one on the house. */
export const PROMO_COINS = 1;

/** Cost of one vend. Heavier slots may cost more later. */
export const VEND_COINS = 1;

export const CARD_COOKIE = "remora_card";

/**
 * A card code is the whole secret: 32 url-safe characters after a prefix, ~190 bits.
 * Only its hash is stored; the code lives in the customer's cookie and nowhere else.
 */
export function newCardCode(): string {
  return `rc_${randomBytes(24).toString("base64url")}`;
}

export function isCardCode(s: unknown): s is string {
  return typeof s === "string" && /^rc_[A-Za-z0-9_-]{32}$/.test(s);
}

export function hashCardCode(code: string): string {
  return createHash("sha256").update(code, "utf8").digest("hex");
}

/** The public handle printed on receipts and shown on the panel: never the code. */
export function cardIdFromHash(hash: string): string {
  return `card_${hash.slice(0, 12)}`;
}

/** "3 coins" / "1 coin" / "no coins". */
export function prettyCoins(n: number): string {
  if (n <= 0) return "no coins";
  return `${n} coin${n === 1 ? "" : "s"}`;
}
