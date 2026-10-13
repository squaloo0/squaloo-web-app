/**
 * The Garage's instrument, as a shim: every countable request becomes one row in
 * garage_hits, written after the response is on its way. Nothing here reads a cookie, an
 * address, or a body; the classification is in src/garage/core/hits.ts and is tested there.
 * This file is on the Garage's touch list (charter section 7) and does nothing else.
 */
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { hitFor, instrumentWired, recordHit } from "@/garage/instrument";

export function middleware(req: NextRequest, event: NextFetchEvent): NextResponse {
  if (instrumentWired()) {
    const h = hitFor(req);
    if (h) event.waitUntil(recordHit(h));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
