/**
 * POST /api/remora/key   form: key=<service key>   → sets the key cookie, back to /remora
 * POST /api/remora/key   form: eject=1             → clears it
 *
 * The keyhole on the side of the machine. Phases 1-3 only; Phase 4 is the coin slot.
 */
import { NextResponse } from "next/server";
import { isServiceKey, KEY_COOKIE, keySlotWired } from "@/remora/auth";

const THIRTY_DAYS = 30 * 24 * 60 * 60;

export async function POST(req: Request): Promise<NextResponse> {
  const form = await req.formData();
  const back = (q = "") => NextResponse.redirect(new URL(`/remora${q}`, req.url), { status: 303 });

  if (form.get("eject")) {
    const res = back();
    res.cookies.set(KEY_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
    return res;
  }

  if (!keySlotWired()) {
    return back("?denied=unwired");
  }
  const key = form.get("key");
  if (typeof key !== "string" || !isServiceKey(key)) {
    return back("?denied=1");
  }

  const res = back();
  res.cookies.set(KEY_COOKIE, key, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
  return res;
}
