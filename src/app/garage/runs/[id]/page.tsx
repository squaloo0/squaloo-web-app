/**
 * /garage/runs/<id> — one run: its row, every event, and the report as written. Keyed.
 */
import Link from "next/link";
import { cookies } from "next/headers";
import AppFooter from "@/components/AppFooter";
import { isGarageKey, KEY_COOKIE } from "@/garage/auth";
import { getRun, listEvents } from "@/garage/db/ledger";
import { runLine } from "@/garage/core/run";

export const metadata = { title: "The Garage — a run", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jar = await cookies();
  const keyed = isGarageKey(jar.get(KEY_COOKIE)?.value);
  const r = keyed && /^[0-9a-f-]{8,36}$/.test(id) ? await getRun(id) : null;
  const events = r ? await listEvents(r.id) : [];

  return (
    <div className="min-h-screen bg-[#08090a] text-white font-mono flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link href="/garage" className="text-neutral-600 text-xs tracking-widest uppercase hover:text-white transition-colors">
            ← The Garage
          </Link>
          <span className="text-neutral-700 text-xs tracking-[0.3em] uppercase">A run</span>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-8 pt-36 pb-24 flex-1 w-full">
        {!keyed ? (
          <p className="text-neutral-600 text-sm">
            Keyed only. <Link href="/garage" className="underline">Turn the key</Link>.
          </p>
        ) : !r ? (
          <p className="text-neutral-600 text-sm">No such run.</p>
        ) : (
          <>
            <div className="text-xs text-neutral-400 mb-2 break-all">{runLine(r)}</div>
            <div className="text-xs text-neutral-600 mb-8">
              model {r.model} · ticket {r.ticket ?? "none"} · command {r.commandId ?? "none"} · finished {r.finishedAt ?? "not yet"}
              {r.branch && ` · branch ${r.branch}`}
              {r.diffHash && ` · diff ${r.diffHash.slice(0, 12)}`}
              {r.verdict && ` · ${r.verdict}`}
              {r.prUrl && (
                <>
                  {" · "}
                  <a href={r.prUrl} className="text-[#5688c7] hover:underline">{r.prUrl}</a>
                </>
              )}
            </div>
            {r.error && <div className="border border-red-900 text-red-300 text-xs p-3 mb-6 whitespace-pre-wrap">{r.error}</div>}
            <h2 className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-2">Events</h2>
            <div className="border border-neutral-800 bg-[#0c0d0f] p-4 mb-8 text-xs text-neutral-400 space-y-1">
              {events.length === 0 && <div className="text-neutral-700">none</div>}
              {events.map((e) => (
                <div key={e.id} className="flex gap-3">
                  <span className="text-neutral-600 shrink-0">{e.at.slice(11, 19)}</span>
                  <span className={`shrink-0 w-10 ${e.kind === "deny" ? "text-amber-400" : e.kind === "halt" ? "text-red-400" : e.kind === "note" ? "text-[#5688c7]" : "text-neutral-500"}`}>{e.kind}</span>
                  <span className="shrink-0 w-16 text-neutral-500">{e.tool ?? ""}</span>
                  <span className="break-all">{e.detail}</span>
                </div>
              ))}
            </div>
            <h2 className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-2">Report</h2>
            <div className="border border-neutral-800 bg-[#0c0d0f] p-4 text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">{r.report ?? <span className="text-neutral-700">no report</span>}</div>
            <div className="mt-8 text-xs text-neutral-600">
              <div className="mb-1">The prompt it was given:</div>
              <div className="border border-neutral-900 p-3 whitespace-pre-wrap text-neutral-500">{r.prompt}</div>
            </div>
          </>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
