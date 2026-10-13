/**
 * POST /api/garage/gate   form: run=<id>, verdict=approve|deny, note?
 * The founder's ruling on a run's diff. Approve writes the approval row the gate guard reads;
 * either way the ruling is an event on the run. Keyed.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isGarageKey, KEY_COOKIE } from "@/garage/auth";
import { rule } from "@/garage/db/ledger";

export async function POST(req: Request): Promise<NextResponse> {
  const back = (q = "") => NextResponse.redirect(new URL(`/garage${q}`, req.url), { status: 303 });
  const jar = await cookies();
  if (!isGarageKey(jar.get(KEY_COOKIE)?.value)) return back("?denied=1");
  const form = await req.formData();
  const run = String(form.get("run") ?? "");
  const verdict = String(form.get("verdict") ?? "");
  if (!/^[0-9a-f-]{8,36}$/.test(run) || (verdict !== "approve" && verdict !== "deny")) return back("?denied=form");
  const note = String(form.get("note") ?? "").trim();
  await rule(run, verdict === "approve" ? "approved" : "denied", "founder", note.length ? note.slice(0, 500) : null);
  return back();
}
