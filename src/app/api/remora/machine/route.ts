/**
 * GET /api/remora/machine   the pulse: READY or OUT OF ORDER, and why. Keyed.
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isServiceKey, KEY_COOKIE } from "@/remora/auth";
import { machineLight } from "@/remora/core/job";
import { dbWired } from "@/remora/db/client";
import { freshestMachine, liveMachines } from "@/remora/db/queue";
import { machineSummary } from "@/remora/core/route";

export async function GET(): Promise<NextResponse> {
  if (!isServiceKey((await cookies()).get(KEY_COOKIE)?.value)) {
    return NextResponse.json({ error: "insert service key" }, { status: 401 });
  }
  if (!dbWired()) return NextResponse.json({ on: false, text: "OUT OF ORDER · no queue wired on this deploy" }, { status: 503 });
  const now = new Date();
  const [machine, live] = await Promise.all([freshestMachine(), liveMachines()]);
  return NextResponse.json(
    { ...machineLight(machine, now), machine, machines: live.map((m) => ({ ...m, summary: machineSummary(m, now) })) },
    { headers: { "cache-control": "no-store" } },
  );
}
