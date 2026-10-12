/**
 * GET /api/remora/jobs/:id   one job, its pill, and (when dropped) hour-long download links.
 * The service key sees any coin; a card sees its own.
 */
import { NextResponse } from "next/server";
import { pill } from "@/remora/core/job";
import { visitor } from "@/remora/card";
import { dbWired } from "@/remora/db/client";
import { assetsForJob, getJob } from "@/remora/db/queue";
import { presignDownload, shelfWired } from "@/remora/storage";

const LINK_SECONDS = 3600;

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const v = await visitor();
  if (v.kind === "nobody") return NextResponse.json({ error: "take a card or turn the key" }, { status: 401 });
  if (!dbWired()) return NextResponse.json({ error: "no queue wired on this deploy" }, { status: 503 });

  const { id } = await ctx.params;
  const job = await getJob(id);
  // A card sees its own coins only; a missing coin and someone else's look the same.
  if (!job || (v.kind === "card" && job.cardId !== v.card.id)) return NextResponse.json({ error: "no such coin" }, { status: 404 });

  const assets = job.status === "completed" ? await assetsForJob(id) : [];
  const drops = assets.map((a) => ({
    kind: a.kind,
    fileName: a.fileName,
    bytes: a.bytes,
    sha256: a.sha256,
    expiresAt: a.expiresAt,
    url: shelfWired() ? presignDownload(a.objectKey, LINK_SECONDS, a.fileName) : null,
  }));
  return NextResponse.json({ ...job, pill: pill(job), drops, linkSeconds: LINK_SECONDS }, { headers: { "cache-control": "no-store" } });
}
