/**
 * squaloo.com/qr: the flyer's short path (SQU-427/428). A route, not a
 * next.config redirect, because config redirects run before middleware and
 * the visit would never be counted. As a route, the site's instrument records
 * one hit on "/qr" first, then this answers 307 to the landing page.
 */
import { NextResponse, type NextRequest } from "next/server";
import { qrRedirectPath } from "@/app/marshal-qr/_lib/meridian";

export function GET(req: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(qrRedirectPath(undefined, "flyer"), req.nextUrl.origin), 307);
}
