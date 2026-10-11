/**
 * GET  /api/remora/jobs            the queue, newest first, plus the machine's light
 * POST /api/remora/jobs            put a coin in the slot: { url, quality } as JSON or a form
 *
 * Keyed through Phase 3. A form POST bounces back to /remora; JSON gets the job (201).
 * 503 when this deploy has no queue wired.
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isServiceKey, KEY_COOKIE } from "@/remora/auth";
import { parseVideoUrl } from "@/remora/core/url";
import { parseQuality } from "@/remora/core/format";
import { machineLight } from "@/remora/core/job";
import { waitingReason } from "@/remora/core/route";
import { dbWired } from "@/remora/db/client";
import { enqueue, freshestMachine, listJobs, liveMachines } from "@/remora/db/queue";

async function keyed(): Promise<boolean> {
  return isServiceKey((await cookies()).get(KEY_COOKIE)?.value);
}

export async function GET(): Promise<NextResponse> {
  if (!(await keyed())) return NextResponse.json({ error: "insert service key" }, { status: 401 });
  if (!dbWired()) return NextResponse.json({ error: "no queue wired on this deploy" }, { status: 503 });
  const now = new Date();
  const [jobs, machine, live] = await Promise.all([listJobs(50), freshestMachine(), liveMachines()]);
  return NextResponse.json(
    {
      jobs: jobs.map((j) => ({ ...j, waiting: waitingReason(j, live, now) })),
      machine,
      machines: live,
      light: machineLight(machine, now),
    },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(req: Request): Promise<NextResponse> {
  if (!(await keyed())) return NextResponse.json({ error: "insert service key" }, { status: 401 });
  const isForm = (req.headers.get("content-type") ?? "").includes("form");
  const back = (q: string) => NextResponse.redirect(new URL(`/remora${q}`, req.url), { status: 303 });

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
  if (!parsed || !parsed.canonicalUrl) {
    return isForm ? back("?coin=not-a-url") : NextResponse.json({ error: "that is not a URL" }, { status: 400 });
  }
  const q = parseQuality(typeof quality === "string" ? quality : undefined);
  if (!q) {
    return isForm ? back("?coin=bad-quality") : NextResponse.json({ error: "quality must be best, 2160..360 or audio" }, { status: 400 });
  }
  if (!dbWired()) {
    return isForm ? back("?coin=no-queue") : NextResponse.json({ error: "no queue wired on this deploy" }, { status: 503 });
  }

  const job = await enqueue({ input: url as string, canonicalUrl: parsed.canonicalUrl, provider: parsed.provider, quality: q });
  return isForm ? back(`?coin=${job.id}`) : NextResponse.json(job, { status: 201 });
}
