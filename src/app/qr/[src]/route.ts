/**
 * squaloo.com/qr/<source>: one counted path per printed QR (SQU-427). The
 * deck's slide encodes /qr/stage and the ask card /qr/card. Only an
 * allowlisted source reaches the Location header; anything else lands on the
 * page as a board scan (tested in _lib/meridian.test.ts).
 */
import { NextResponse, type NextRequest } from "next/server";
import { qrRedirectPath } from "@/app/marshal-qr/_lib/meridian";

export async function GET(req: NextRequest, ctx: { params: Promise<{ src: string }> }): Promise<NextResponse> {
  const { src } = await ctx.params;
  return NextResponse.redirect(new URL(qrRedirectPath(src), req.nextUrl.origin), 307);
}
