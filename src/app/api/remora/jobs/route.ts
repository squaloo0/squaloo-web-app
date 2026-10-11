/**
 * GET  /api/remora/jobs     the queue (all of it for the service key; this card's for a card) + the machines
 * POST /api/remora/jobs     put a coin in: { url, quality } as JSON or a form
 *
 * A card spends one coin per vend, atomically with the enqueue. The service key vends
 * free. Nobody else vends. 503 when this deploy has no queue wired.
 */
import { NextResponse } from "next/server";
import { parseVideoUrl } from "@/remora/core/url";
import { parseQuality } from "@/remora/core/format";
import { machineLight } from "@/remora/core/job";
import { waitingReason } from "@/remora/core/route";
import { dbWired } from "@/remora/db/client";
import { enqueue, freshestMachine, listJobs, liveMachines } from "@/remora/db/queue";
import { enqueueWithCoin, listJobsForCard } from "@/remora/db/coins";
import { visitor } from "@/remora/card";

export async function GET(): Promise<NextResponse> {
  const v = await visitor();
  if (v.kind === "nobody") return NextResponse.json({ error: "take a card or turn the key" }, { status: 401 });
  if (!dbWired()) return NextResponse.json({ error: "no queue wired on this deploy" }, { status: 503 });
  const now = new Date();
  const [jobs, machine, live] = await Promise.all([v.kind === "keyed" ? listJobs(50) : listJobsForCard(v.card.id, 50), freshestMachine(), liveMachines()]);
  return NextResponse.json(
    {
      jobs: jobs.map((j) => ({ ...j, waiting: waitingReason(j, live, now) })),
      machine,
      machines: live,
      light: machineLight(machine, now),
      ...(v.kind === "card" ? { card: v.card.id, coins: v.coins } : {}),
    },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(req: Request): Promise<NextResponse> {
  const isForm = (req.headers.get("content-type") ?? "").includes("form");
  const back = (q: string) => NextResponse.redirect(new URL(`/remora${q}`, req.url), { status: 303 });
  const fail = (q: string, error: string, status: number) => (isForm ? back(q) : NextResponse.json({ error }, { status }));

  const v = await visitor();
  if (v.kind === "nobody") return fail("?coin=no-card", "take a card or turn the key", 401);

  let url: unknown;
  let quality: unknown;
  if (isForm) {
    const form = await req.formData();
    url = form.get("url");
    quality = form.get("quality");
  } else {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    url = body.url;
    quality = body.quality;
  }

  const parsed = typeof url === "string" ? parseVideoUrl(url) : null;
  if (!parsed || !parsed.canonicalUrl) return fail("?coin=not-a-url", "that is not a URL", 400);
  const q = parseQuality(typeof quality === "string" ? quality : undefined);
  if (!q) return fail("?coin=bad-quality", "quality must be best, 2160..360 or audio", 400);
  if (!dbWired()) return fail("?coin=no-queue", "no queue wired on this deploy", 503);

  const coin = { input: url as string, canonicalUrl: parsed.canonicalUrl, provider: parsed.provider, quality: q };
  const job = v.kind === "keyed" ? await enqueue(coin) : await enqueueWithCoin({ ...coin, cardId: v.card.id });
  if (!job) return fail("?coin=empty", "no coins on this card", 402);
  return isForm ? back(`?coin=${job.id}`) : NextResponse.json(job, { status: 201 });
}
