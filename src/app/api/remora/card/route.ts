/**
 * POST /api/remora/card              take a card: mints one with its promo coin, sets the cookie
 * POST /api/remora/card  eject=1     put the card back (clears the cookie; the card still exists)
 * GET  /api/remora/card              this card's balance and ledger
 */
import { NextResponse } from "next/server";
import { CARD_COOKIE, prettyCoins } from "@/remora/core/coins";
import { dbWired } from "@/remora/db/client";
import { createCard, ledgerOf } from "@/remora/db/coins";
import { CARD_COOKIE_OPTIONS, clientIp, visitor } from "@/remora/card";

export async function GET(): Promise<NextResponse> {
  const v = await visitor();
  if (v.kind !== "card") return NextResponse.json({ error: "no card in the slot" }, { status: 401 });
  const ledger = await ledgerOf(v.card.id);
  return NextResponse.json({ card: v.card.id, coins: v.coins, ledger }, { headers: { "cache-control": "no-store" } });
}

export async function POST(req: Request): Promise<NextResponse> {
  const isForm = (req.headers.get("content-type") ?? "").includes("form");
  const back = (q = "") => NextResponse.redirect(new URL(`/remora${q}`, req.url), { status: 303 });
  const form = isForm ? await req.formData() : null;

  if (form?.get("eject")) {
    const res = back();
    res.cookies.set(CARD_COOKIE, "", { ...CARD_COOKIE_OPTIONS, maxAge: 0 });
    return res;
  }
  if (!dbWired()) {
    return isForm ? back("?card=no-queue") : NextResponse.json({ error: "no queue wired on this deploy" }, { status: 503 });
  }
  const minted = await createCard(clientIp(req));
  if (!minted) {
    return isForm ? back("?card=limit") : NextResponse.json({ error: "enough cards for one address today" }, { status: 429 });
  }
  const res = isForm
    ? back(`?card=${minted.card.id}`)
    : NextResponse.json({ card: minted.card.id, coins: minted.coins, note: `${prettyCoins(minted.coins)} on the house` }, { status: 201 });
  // The code lives in this cookie and nowhere else. It is not returned in the body.
  res.cookies.set(CARD_COOKIE, minted.code, CARD_COOKIE_OPTIONS);
  return res;
}
