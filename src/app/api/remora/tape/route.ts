/**
 * GET /api/remora/tape   the open books. Public, no titles, cached a minute.
 */
import { NextResponse } from "next/server";
import { theTape } from "@/remora/tape";

export async function GET(): Promise<NextResponse> {
  const tape = await theTape();
  if (!tape) return NextResponse.json({ error: "no queue wired on this deploy" }, { status: 503 });
  return NextResponse.json(tape, { headers: { "cache-control": "public, max-age=60" } });
}
