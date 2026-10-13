/**
 * POST /api/garage/order   form: hat, every (hours), prompt?, ticket?   → a standing order
 * POST /api/garage/order   form: id, action=on|off|rm                  → toggles or removes one
 * Keyed. Report-only hats only (charter 0.4); the work loop ticks them.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isGarageKey, KEY_COOKIE } from "@/garage/auth";
import { ledgerWired } from "@/garage/db/client";
import { addOrder, deleteOrder, setOrderEnabled } from "@/garage/db/ledger";
import { ORDERABLE_HATS, parseEveryHours } from "@/garage/core/orders";

export async function POST(req: Request): Promise<NextResponse> {
  const back = (q = "") => NextResponse.redirect(new URL(`/garage${q}`, req.url), { status: 303 });
  const jar = await cookies();
  if (!isGarageKey(jar.get(KEY_COOKIE)?.value)) return back("?denied=1");
  if (!ledgerWired()) return back("?denied=unwired");
  const form = await req.formData();
  const id = String(form.get("id") ?? "");
  const action = String(form.get("action") ?? "");
  if (/^\d+$/.test(id) && (action === "on" || action === "off" || action === "rm")) {
    if (action === "rm") await deleteOrder(Number(id));
    else await setOrderEnabled(Number(id), action === "on");
    return back();
  }
  const hat = String(form.get("hat") ?? "");
  const every = parseEveryHours(String(form.get("every") ?? ""));
  if (!ORDERABLE_HATS.includes(hat) || every === null) return back("?denied=order");
  const prompt = String(form.get("prompt") ?? "").trim();
  const ticket = String(form.get("ticket") ?? "").trim();
  await addOrder({ hat, prompt: prompt.length ? prompt.slice(0, 4000) : null, ticket: ticket.length ? ticket.slice(0, 64) : null, everyHours: every, by: "founder" });
  return back("?ordered=1");
}
