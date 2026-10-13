/**
 * /garage — the founder's pane of glass on the cleaning station. Keyed. Runs, spend against
 * the caps, the gate (diffs waiting for a ruling), the command box, and the queue. Reads the
 * ledger directly; the agent never writes here.
 */
import Link from "next/link";
import { cookies } from "next/headers";
import AppFooter from "@/components/AppFooter";
import Wordmark from "@/components/Wordmark";
import { isGarageKey, KEY_COOKIE, keySlotWired } from "@/garage/auth";
import { ledgerWired } from "@/garage/db/client";
import { gateQueue, hitsSummary, listCommands, listRuns, neonLedger, queuedCount, type CommandRow, type HitsSummary } from "@/garage/db/ledger";
import { PER_DAY_USD, PER_RUN_USD, prettyUsd } from "@/garage/core/budget";
import { shortId, type RunRow } from "@/garage/core/run";
import Poller from "./poller";

export const metadata = {
  title: "The Garage",
  description: "Where Squaloo's headless agents live.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function GaragePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const jar = await cookies();
  const keyed = isGarageKey(jar.get(KEY_COOKIE)?.value);
  const wired = ledgerWired();

  const [runs, gate, commands, queued, spent, hits] = keyed && wired ? await Promise.all([listRuns(20), gateQueue(), listCommands(12), queuedCount(), neonLedger.spentTodayUsd(), hitsSummary(7)]) : [[], [], [], 0, 0, null];
  const running = commands.some((c) => c.status === "running" || c.status === "queued");

  return (
    <div className="min-h-screen bg-[#08090a] text-white font-mono flex flex-col">
      {keyed && <Poller everyMs={running ? 5_000 : 60_000} />}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-1.5 text-neutral-600 text-xs tracking-widest uppercase hover:text-white transition-colors">
            ← <Wordmark className="h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </Link>
          <span className="hidden sm:inline shrink-0 whitespace-nowrap text-neutral-700 text-xs tracking-[0.3em] uppercase">The Garage</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-8 pt-36 pb-24 flex-1 w-full">
        <div className="mb-10">
          <div className="text-xs tracking-[0.3em] text-neutral-500 uppercase mb-2">Garage · wrasse</div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-3">The cleaning station</h1>
          <p className="text-neutral-500 text-sm leading-relaxed">
            One agent, one job, every run on the record. The charter is its system prompt; the ledger is its only memory;
            nothing it writes ships without a ruling here.
          </p>
        </div>

        {!keyed ? (
          <KeyForm denied={typeof sp.denied === "string" ? sp.denied : null} wired={keySlotWired()} />
        ) : !wired ? (
          <Dashed>No ledger wired on this deploy</Dashed>
        ) : (
          <>
            <section className="border border-neutral-800 bg-[#0c0d0f] mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-neutral-800">
                <Counter label="spent today" value={`${prettyUsd(spent)} / ${prettyUsd(PER_DAY_USD)}`} />
                <Counter label="per run" value={prettyUsd(PER_RUN_USD)} />
                <Counter label="at the gate" value={String(gate.length)} />
                <Counter label="queued" value={String(queued)} />
              </div>
            </section>

            <Section title="The gate" hint="diffs waiting for a ruling">
              {gate.length === 0 ? (
                <Dashed>Nothing at the gate. Rung 0 reads and reports; diffs arrive at rung 1.</Dashed>
              ) : (
                gate.map((r) => <GateRow key={r.id} r={r} />)
              )}
            </Section>

            <Section title="Command" hint="a host running `garage work` picks it up">
              <form method="POST" action="/api/garage/command" className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <label className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 self-center">hat</label>
                  <select name="hat" className="bg-black border border-neutral-800 text-sm px-2 py-1 text-neutral-200 min-w-0 max-w-full">
                    <option value="report">report · rung 0 · read and report</option>
                    <option value="propose">propose · rung 1 · a change on a branch, behind the gate</option>
                  </select>
                  <input name="ticket" placeholder="ticket (optional)" className="bg-black border border-neutral-800 text-sm px-2 py-1 text-neutral-200 flex-1 min-w-0 basis-full sm:basis-auto" />
                </div>
                <textarea
                  name="prompt"
                  rows={3}
                  placeholder="Leave empty for the hat's own prompt, or tell wrasse what to look at this run."
                  className="w-full bg-black border border-neutral-800 text-sm px-2 py-1 text-neutral-200"
                />
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 text-xs">{sp.queued ? "queued." : ""}</span>
                  <button className="border border-[#5688c7] text-[#5688c7] hover:bg-[#5688c7] hover:text-black px-4 py-1.5 text-xs tracking-[0.2em] uppercase transition-colors">
                    Queue the run
                  </button>
                </div>
              </form>
            </Section>

            <Section title="The instrument" hint="first-party · server-side · last 7 days UTC · no addresses, no raw user agents">
              {hits && hits.total > 0 ? <Instrument s={hits} /> : <Dashed>{hits?.firstHitAt ? "No hits in the last 7 days" : "The instrument has not recorded a hit yet"}</Dashed>}
            </Section>

            <Section title="The queue" hint="newest first">
              {commands.length === 0 ? <Dashed>No commands yet</Dashed> : commands.map((c) => <CommandLine key={c.id} c={c} />)}
            </Section>

            <Section title="The ledger" hint="the last 20 runs, newest first">
              {runs.length === 0 ? <Dashed>No runs yet; the station is quiet</Dashed> : runs.map((r) => <RunLine key={r.id} r={r} />)}
            </Section>

            <form method="POST" action="/api/garage/key" className="mt-10 text-right">
              <input type="hidden" name="eject" value="1" />
              <button className="text-neutral-700 hover:text-neutral-400 text-[10px] tracking-[0.3em] uppercase">eject key</button>
            </form>
          </>
        )}
      </main>
      <AppFooter />
    </div>
  );
}

function KeyForm({ denied, wired }: { denied: string | null; wired: boolean }) {
  return (
    <form method="POST" action="/api/garage/key" className="border border-neutral-800 bg-[#0c0d0f] p-6">
      <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 mb-3">The founder&apos;s key</div>
      {!wired ? (
        <p className="text-neutral-600 text-sm">No key slot on this deploy.</p>
      ) : (
        <div className="flex gap-3">
          <input name="key" type="password" autoComplete="off" className="flex-1 bg-black border border-neutral-800 text-sm px-2 py-1 text-neutral-200" />
          <button className="border border-neutral-700 text-neutral-300 hover:border-white hover:text-white px-4 py-1.5 text-xs tracking-[0.2em] uppercase">Turn</button>
        </div>
      )}
      {denied && <p className="text-red-400 text-xs mt-3">{denied === "unwired" ? "no key slot" : "that key does not turn"}</p>}
    </form>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-x-4 gap-y-0.5 mb-2">
        <h2 className="text-xs tracking-[0.3em] uppercase text-neutral-400 shrink-0">{title}</h2>
        <span className="text-neutral-700 text-[10px] sm:text-right">{hint}</span>
      </div>
      <div className="border border-neutral-800 bg-[#0c0d0f] p-4 space-y-2 min-w-0 overflow-hidden">{children}</div>
    </section>
  );
}

function Counter({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-4">
      <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-600 mb-1">{label}</div>
      <div className="text-lg text-white">{value}</div>
    </div>
  );
}

function Dashed({ children }: { children: React.ReactNode }) {
  return <div className="border border-dashed border-neutral-800 py-6 text-center text-[10px] tracking-[0.3em] uppercase text-neutral-700">{children}</div>;
}

function Pill({ status, halt }: { status: RunRow["status"] | CommandRow["status"]; halt?: string | null }) {
  const tone =
    status === "done" ? "text-[#63a375] border-[#63a375]/40" : status === "running" || status === "queued" ? "text-[#5688c7] border-[#5688c7]/40" : status === "halted" ? "text-amber-400 border-amber-400/40" : "text-red-400 border-red-400/40";
  return <span className={`border px-1.5 py-0.5 text-[10px] tracking-widest uppercase ${tone}`}>{halt ? `${status}: ${halt}` : status}</span>;
}

function RunLine({ r }: { r: RunRow }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400 min-w-0">
      <Link href={`/garage/runs/${r.id}`} className="text-neutral-200 hover:text-white underline-offset-4 hover:underline">
        {shortId(r.id)}
      </Link>
      <span className="text-neutral-600">{r.startedAt.slice(0, 16).replace("T", " ")}Z</span>
      <span>{r.machine}</span>
      <span>{r.hat}</span>
      <span className="text-neutral-600">rung {r.rung}</span>
      <Pill status={r.status} halt={r.haltReason} />
      <span>{prettyUsd(r.costUsd)}</span>
      <span className="text-neutral-600">
        {r.turns}t · {r.toolCalls} tools · {r.denials} refused
      </span>
      {r.verdict && <span className="text-neutral-500">{r.verdict}</span>}
      {r.prUrl && (
        <a href={r.prUrl} className="text-[#5688c7] hover:underline" target="_blank" rel="noreferrer">
          PR
        </a>
      )}
    </div>
  );
}

function GateRow({ r }: { r: RunRow }) {
  return (
    <div className="border border-neutral-800 p-3 space-y-2">
      <RunLine r={r} />
      <div className="text-xs text-neutral-500 break-all">
        branch <span className="text-neutral-300">{r.branch ?? "?"}</span> · diff <span className="text-neutral-300">{r.diffHash?.slice(0, 12)}</span> ·{" "}
        <Link href={`/garage/runs/${r.id}`} className="underline-offset-4 hover:underline">
          read the gate comment
        </Link>
      </div>
      <form method="POST" action="/api/garage/gate" className="flex flex-wrap gap-2 items-center">
        <input type="hidden" name="run" value={r.id} />
        <input name="note" placeholder="gate note" className="flex-1 min-w-0 basis-full sm:basis-auto bg-black border border-neutral-800 text-xs px-2 py-1 text-neutral-200" />
        <button name="verdict" value="approve" className="border border-[#63a375] text-[#63a375] hover:bg-[#63a375] hover:text-black px-3 py-1 text-[10px] tracking-[0.2em] uppercase">
          Approve
        </button>
        <button name="verdict" value="deny" className="border border-red-400 text-red-400 hover:bg-red-400 hover:text-black px-3 py-1 text-[10px] tracking-[0.2em] uppercase">
          Deny
        </button>
      </form>
    </div>
  );
}

function CommandLine({ c }: { c: CommandRow }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
      <span className="text-neutral-600">#{c.id}</span>
      <span className="text-neutral-600">{c.createdAt.slice(0, 16).replace("T", " ")}Z</span>
      <span>{c.hat}</span>
      {c.ticket && <span className="text-neutral-500">{c.ticket}</span>}
      <Pill status={c.status} />
      {c.pickedBy && <span className="text-neutral-600">on {c.pickedBy}</span>}
      {c.runId && (
        <Link href={`/garage/runs/${c.runId}`} className="text-neutral-300 hover:text-white underline-offset-4 hover:underline">
          run {shortId(c.runId)}
        </Link>
      )}
      {c.prompt && <span className="text-neutral-600 truncate max-w-full sm:max-w-xs" title={c.prompt}>“{c.prompt.slice(0, 60)}{c.prompt.length > 60 ? "…" : ""}”</span>}
      {c.status === "queued" && (
        <form method="POST" action="/api/garage/command">
          <input type="hidden" name="cancel" value={c.id} />
          <button className="text-neutral-700 hover:text-red-400 text-[10px] tracking-widest uppercase">cancel</button>
        </form>
      )}
    </div>
  );
}

function Instrument({ s }: { s: HitsSummary }) {
  const kinds = s.byKind.map((k) => k.kind);
  const days = [...new Set(s.byDay.map((d) => d.day))];
  const cell = (day: string, kind: string) => s.byDay.find((d) => d.day === day && d.kind === kind)?.n ?? 0;
  return (
    <div className="space-y-4 text-xs text-neutral-400">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span className="text-neutral-200">{s.total} hits</span>
        {s.byKind.map((k) => (
          <span key={k.kind}>
            <span className="text-neutral-300">{k.kind}</span> {k.n} <span className="text-neutral-600">({Math.round((100 * k.n) / s.total)}%)</span>
          </span>
        ))}
        <span className="text-neutral-600">counting since {s.firstHitAt?.slice(0, 16).replace("T", " ")}Z</span>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] tracking-[0.2em] uppercase text-neutral-600">
            <th className="pr-3 font-normal whitespace-nowrap">day</th>
            {kinds.map((k) => (
              <th key={k} className="pr-3 font-normal align-bottom">{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d} className="border-t border-neutral-900">
              <td className="pr-3 py-1 text-neutral-500 whitespace-nowrap">{d}</td>
              {kinds.map((k) => (
                <td key={k} className="pr-3 py-1">{cell(d, k) || <span className="text-neutral-800">·</span>}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-neutral-600 mb-1">top paths</div>
          {s.topPaths.slice(0, 12).map((p, i) => (
            <div key={i} className="flex justify-between gap-2">
              <span className="truncate">{p.path} <span className="text-neutral-600">{p.kind}</span></span>
              <span className="text-neutral-300">{p.n}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-neutral-600 mb-1">families</div>
          {s.families.slice(0, 12).map((f, i) => (
            <div key={i} className="flex justify-between gap-2">
              <span className="truncate">{f.family} <span className="text-neutral-600">{f.kind}</span></span>
              <span className="text-neutral-300">{f.n}</span>
            </div>
          ))}
          {s.referrers.length > 0 && (
            <>
              <div className="text-[10px] tracking-[0.2em] uppercase text-neutral-600 mt-3 mb-1">referrers</div>
              {s.referrers.slice(0, 8).map((r, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <span className="truncate">{r.refHost}</span>
                  <span className="text-neutral-300">{r.n}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
