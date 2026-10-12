/**
 * GET /api/remora/thumb?u=<provider thumbnail URL>
 *
 * Streams a provider's thumbnail from our own origin so the browser never loads
 * i.ytimg.com or i.vimeocdn.com directly. House style: the page arguing for data
 * sovereignty does not quietly ping third parties on arrival.
 *
 * Allowlisted hosts only (core/oembed THUMB_HOSTS). Keyed like the rest of the machine.
 */
import { NextResponse } from "next/server";
import { visitor } from "@/remora/card";
import { isThumbUrl } from "@/remora/core/oembed";

const TIMEOUT_MS = 8_000;
const MAX_BYTES = 2 * 1024 * 1024;

export async function GET(req: Request): Promise<Response> {
  if ((await visitor()).kind === "nobody") {
    return NextResponse.json({ error: "take a card or turn the key" }, { status: 401 });
  }

  const u = new URL(req.url).searchParams.get("u");
  if (!u || !isThumbUrl(u)) {
    return NextResponse.json({ error: "not a thumbnail host we fetch from" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(u, { signal: AbortSignal.timeout(TIMEOUT_MS), next: { revalidate: 86_400 } });
  } catch {
    return NextResponse.json({ error: "thumbnail host unreachable" }, { status: 502 });
  }

  const type = upstream.headers.get("content-type") ?? "";
  const length = Number(upstream.headers.get("content-length") ?? 0);
  if (!upstream.ok || !type.startsWith("image/") || length > MAX_BYTES || !upstream.body) {
    return NextResponse.json({ error: "no image there" }, { status: upstream.ok ? 502 : 404 });
  }

  return new Response(upstream.body, {
    headers: {
      "content-type": type,
      "cache-control": "private, max-age=86400",
      "x-content-type-options": "nosniff",
    },
  });
}
