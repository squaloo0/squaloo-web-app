/**
 * POST /api/garage/key   form: key=<founder's key>   → sets the cookie, back to /garage
 * POST /api/garage/key   form: eject=1               → clears it
 */
import { NextResponse } from "next/server";
import { isGarageKey, KEY_COOKIE, keySlotWired } from "@/garage/auth";

const THIRTY_DAYS = 30 * 24 * 60 * 60;

export async function POST(req: Request): Promise<NextResponse> {
  const form = await req.formData();
  const back = (q = "") => NextResponse.redirect(new URL(`/garage${q}`, req.url), { status: 303 });
  if (form.get("eject")) {
    const res = back();
    res.cookies.set(KEY_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
    return res;
  }
  if (!keySlotWired()) return back("?denied=unwired");
  const key = form.get("key");
  if (typeof key !== "string" || !isGarageKey(key)) return back("?denied=1");
  const res = back();
  res.cookies.set(KEY_COOKIE, key, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: THIRTY_DAYS });
  return res;
}
