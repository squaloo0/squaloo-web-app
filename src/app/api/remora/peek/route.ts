/**
 * GET /api/remora/peek?url=<pasted>
 *
 * Server-side oEmbed. Returns { provider, id, canonicalUrl, title, author, thumbnail }
 * where `thumbnail` is a same-origin proxy path, so the browser contacts nothing
 * third-party. No yt-dlp here: Vercel never runs the machine.
 *
 *   401  no service key (Phase 1-3: the machine is keyed)
 *   400  not a URL · 404 no window for that provider, or nothing there
 *   502  provider misbehaved · 504 provider slow
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isServiceKey, KEY_COOKIE } from "@/remora/auth";
import { peek } from "@/remora/peek";
import { thumbProxyPath } from "@/remora/core/oembed";

export async function GET(req: Request): Promise<NextResponse> {
  const jar = await cookies();
  if (!isServiceKey(jar.get(KEY_COOKIE)?.value)) {
    return NextResponse.json({ error: "insert service key" }, { status: 401 });
  }

  const url = new URL(req.url).searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "give me a URL: ?url=" }, { status: 400 });
  }

  const result = await peek(url);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(
    { ...result.peek, thumbnail: thumbProxyPath(result.peek.thumbnail) },
    { headers: { "cache-control": "private, max-age=300" } },
  );
}
