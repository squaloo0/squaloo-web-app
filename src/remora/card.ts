/**
 * Who is at the machine: the service key (founder), a punch card (customer), or nobody.
 * Reads cookies on the server; the rest is in core/coins.ts and db/coins.ts.
 */
import { cookies } from "next/headers";
import { isServiceKey, KEY_COOKIE } from "./auth";
import { CARD_COOKIE, isCardCode } from "./core/coins";
import { balanceOf, cardByCode, type Card } from "./db/coins";
import { dbWired } from "./db/client";

export type Visitor =
  | { kind: "keyed" }
  | { kind: "card"; card: Card; coins: number }
  | { kind: "nobody" };

export async function visitor(): Promise<Visitor> {
  const jar = await cookies();
  if (isServiceKey(jar.get(KEY_COOKIE)?.value)) return { kind: "keyed" };
  const code = jar.get(CARD_COOKIE)?.value;
  if (!dbWired() || !isCardCode(code)) return { kind: "nobody" };
  const card = await cardByCode(code);
  if (!card) return { kind: "nobody" };
  return { kind: "card", card, coins: await balanceOf(card.id) };
}

export const CARD_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 365 * 24 * 60 * 60,
};

/** Best-effort client address for the promo-coin cap. Vercel sets x-forwarded-for. */
export function clientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : (req.headers.get("x-real-ip") ?? null);
}
