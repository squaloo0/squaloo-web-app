/**
 * GET /api/remora/machine   the pulse: READY or OUT OF ORDER, and why. Keyed.
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isServiceKey, KEY_COOKIE } from "@/remora/auth";
import { machineLight } from "@/remora/core/job";
import { dbWired } from "@/remora/db/client";
import { freshestMachine } from "@/remora/db/queue";

export async function GET(): Promise<NextResponse> {
  if (!isServiceKey((await cookies()).get(KEY_COOKIE)?.value)) {
    return NextResponse.json({ error: "insert service key" }, { status: 401 });
  }
  if (!dbWired()) return NextResponse.json({ on: false, text: "OUT OF ORDER · no queue wired on this deploy" }, { status: 503 });
  const machine = await freshestMachine();
  return NextResponse.json({ ...machineLight(machine, new Date()), machine }, { headers: { "cache-control": "no-store" } });
}
