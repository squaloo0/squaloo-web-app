/**
 * POST /api/garage/command   form: hat, prompt?, ticket?   → a queued command for the next host
 * POST /api/garage/command   form: cancel=<id>             → cancels one that has not been picked up
 * Keyed. The dashboard's command box posts here; a host running `garage work` picks it up.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isGarageKey, KEY_COOKIE } from "@/garage/auth";
import { ledgerWired } from "@/garage/db/client";
import { cancelCommand, enqueueCommand } from "@/garage/db/ledger";

const HATS = new Set(["report", "propose"]);

export async function POST(req: Request): Promise<NextResponse> {
  const back = (q = "") => NextResponse.redirect(new URL(`/garage${q}`, req.url), { status: 303 });
  const jar = await cookies();
  if (!isGarageKey(jar.get(KEY_COOKIE)?.value)) return back("?denied=1");
  if (!ledgerWired()) return back("?denied=unwired");
  const form = await req.formData();
  const cancel = form.get("cancel");
  if (typeof cancel === "string" && /^\d+$/.test(cancel)) {
    await cancelCommand(Number(cancel));
    return back();
  }
  const hat = String(form.get("hat") ?? "");
  if (!HATS.has(hat)) return back("?denied=hat");
  const prompt = String(form.get("prompt") ?? "").trim();
  const ticket = String(form.get("ticket") ?? "").trim();
  await enqueueCommand({ hat, prompt: prompt.length ? prompt.slice(0, 4000) : null, ticket: ticket.length ? ticket.slice(0, 64) : null, by: "founder" });
  return back("?queued=1");
}
