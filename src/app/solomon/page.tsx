/* eslint-disable @next/next/no-img-element -- the kit's linework is static SVG; there is nothing to optimise */
/**
 * solomon-os.ai (served here at /solomon; next.config.ts rewrites the bare
 * domain onto it): brand/mockups/solomon.html (kit v0.1), implemented.
 * A datasheet on ink; the blue is the only highlight. Desktop follows the
 * mockup's measurements; below `md` the type steps down, the grids stack, and
 * the custody diagram scrolls inside its own frame so the page never does.
 *
 * Numbers: the mockup's [bracketed] placeholders are rendered in the kit's
 * "not measured" state, the way the mockup already draws the refusal-class
 * card, until the founder fills them from a published, dated record.
 */
import AppFooter from "@/components/AppFooter";
import { brand, HOUSE_URL } from "@/lib/brand";

export const metadata = {
  title: "Solomon — by Squaloo",
  description:
    "Answers at the machine, offline. Solomon keeps what the veteran knows and answers with it on hardware the plant owns. Every answer shows who said it and which page agrees; what the machine read is next.",
};

const WRAP = "mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-12";
const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.2em]";

/** A word on a blue pill: the Solomon headline's one highlight. */
function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`rounded-lg bg-solomon-blue px-3 text-on-solomon-blue ${className}`}>{children}</span>;
}

function Marker({ children }: { children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2.5 ${EYEBROW} text-sq-label-paper`}>
      <img src={brand.tilePaper} alt="" className="h-3 w-3" />
      <span>{children}</span>
    </div>
  );
}

const surfaces: { name: string; text: string; next?: boolean }[] = [
  { name: "Chat", text: "Stock Mattermost, a bot in the channel the crew already uses. Today." },
  { name: "Phone", text: "A visitor’s phone on the body’s own Wi-Fi, zero internet. Today." },
  { name: "Touchscreen", text: "The 7-inch screen at the machine. Next: on the bench now.", next: true },
  { name: "Voice", text: "Hands busy. Next, gated by the ruler.", next: true },
  { name: "Command line", text: "The same call from a terminal. Next.", next: true },
  { name: "Library", text: "The same call from inside your own code, receipts and refusal included. Next.", next: true },
  { name: "Agent", text: "An agent that acts, with the same receipts. Next.", next: true },
];

function CustodyDiagram() {
  return (
    <svg
      viewBox="0 0 1080 430"
      width="100%"
      role="img"
      aria-label="Solomon: the engine at the site edge, the Brain in the customer tenant, and only the measurement reaching Squaloo"
      className="block min-w-[760px] font-mono md:min-w-0"
    >
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#c9c1ad" />
        </marker>
        <marker id="arrb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#f7f3e8" />
        </marker>
      </defs>
      <text x="20" y="26" fill="#f7f3e8" fontSize="12" letterSpacing="2">SITE EDGE · OFFLINE · HARDWARE YOU OWN</text>
      <text x="416" y="26" fill="#f7f3e8" fontSize="12" letterSpacing="2">YOUR TENANT · YOUR KEYS</text>
      <text x="786" y="26" fill="#f7f3e8" fontSize="12" letterSpacing="2">SQUALOO · THE MEASUREMENT ONLY</text>
      <line x1="400" y1="40" x2="400" y2="410" stroke="#c9c1ad" strokeWidth="1" strokeDasharray="4 6" />
      <line x1="770" y1="40" x2="770" y2="410" stroke="#c9c1ad" strokeWidth="1" strokeDasharray="4 6" />
      <text x="408" y="404" fill="#c9c1ad" fontSize="10" letterSpacing="2">CUSTODY LINE</text>
      <text x="778" y="404" fill="#c9c1ad" fontSize="10" letterSpacing="2">CUSTODY LINE · CONTENT STRIPPED</text>
      <g stroke="#c9c1ad" fill="none" strokeWidth="1">
        <rect x="20" y="70" width="200" height="54" rx="6" />
        <rect x="20" y="160" width="200" height="54" rx="6" />
        <rect x="20" y="250" width="200" height="54" rx="6" />
      </g>
      <g fill="#f7f3e8" fontSize="12">
        <text x="34" y="92">THE VETERAN</text>
        <text x="34" y="110" fill="#c9c1ad" fontSize="11">a note, as the work happens</text>
        <text x="34" y="182">THE MANUAL</text>
        <text x="34" y="200" fill="#c9c1ad" fontSize="11">OEM · SOP · regulation</text>
        <text x="34" y="272">THE MACHINE</text>
        <text x="34" y="290" fill="#c9c1ad" fontSize="11">the controller’s own export</text>
      </g>
      <g stroke="#c9c1ad" strokeWidth="1.2" fill="none" markerEnd="url(#arr)">
        <path d="M220 97 C 238 97, 240 168, 252 170" />
        <path d="M220 187 L 250 187" />
        <path d="M220 277 C 238 277, 240 206, 252 204" />
      </g>
      <polygon points="280,137 320,137 348,165 348,209 320,237 280,237 252,209 252,165" fill="#0a369d" stroke="#f7f3e8" strokeWidth="1.5" />
      <text x="300" y="182" fill="#f7f3e8" fontSize="12" fontWeight="600" textAnchor="middle">SOLOMON</text>
      <text x="300" y="199" fill="#f7f3e8" fontSize="10" textAnchor="middle">the engine</text>
      <text x="300" y="259" fill="#c9c1ad" fontSize="10" textAnchor="middle">model-agnostic · ruler-gated</text>
      <path d="M300 266 L 300 302" stroke="#f7f3e8" strokeWidth="1.2" fill="none" markerEnd="url(#arrb)" />
      <rect x="160" y="306" width="234" height="88" rx="6" fill="none" stroke="#f7f3e8" strokeWidth="1.2" />
      <text x="174" y="328" fill="#f7f3e8" fontSize="12" fontWeight="600">THE ANSWER + RECEIPTS</text>
      <text x="174" y="346" fill="#c9c1ad" fontSize="11">who said it · which page agrees</text>
      <text x="174" y="363" fill="#c9c1ad" fontSize="11">what the machine read (next)</text>
      <text x="174" y="381" fill="#c9c1ad" fontSize="11">chat · phone (touchscreen next)</text>
      <path d="M348 187 L 470 187" stroke="#c9c1ad" strokeWidth="1.2" fill="none" markerEnd="url(#arr)" />
      <text x="378" y="178" fill="#c9c1ad" fontSize="10" letterSpacing="1">SYNC ONCE</text>
      <rect x="476" y="130" width="250" height="114" rx="6" fill="none" stroke="#f7f3e8" strokeWidth="1.2" />
      <text x="492" y="156" fill="#f7f3e8" fontSize="12" fontWeight="600">THE BRAIN</text>
      <text x="492" y="178" fill="#d9d2c2" fontSize="11">every word, every reading</text>
      <text x="492" y="196" fill="#d9d2c2" fontSize="11">the record the auditor asks for</text>
      <text x="492" y="214" fill="#d9d2c2" fontSize="11">your tenant, your keys</text>
      <text x="492" y="232" fill="#c9c1ad" fontSize="10">by design, Squaloo holds no copy</text>
      <path d="M726 187 L 840 187" stroke="#c9c1ad" strokeWidth="1.2" fill="none" markerEnd="url(#arr)" strokeDasharray="6 4" />
      <text x="728" y="176" fill="#c9c1ad" fontSize="9.5" letterSpacing="1">MEASUREMENT ONLY</text>
      <rect x="846" y="130" width="222" height="114" rx="6" fill="none" stroke="#c9c1ad" strokeWidth="1" />
      <text x="862" y="156" fill="#f7f3e8" fontSize="12" fontWeight="600">THE RULER’S RECORD</text>
      <text x="862" y="178" fill="#d9d2c2" fontSize="11">pass · fail · latency</text>
      <text x="862" y="196" fill="#d9d2c2" fontSize="11">refusal class, nothing else</text>
      <text x="862" y="214" fill="#d9d2c2" fontSize="11">no words, readings or names</text>
      <text x="862" y="232" fill="#c9c1ad" fontSize="10">to be published, re-runnable</text>
    </svg>
  );
}

/** A measurement card with no published record behind it: the kit's "not measured" state. */
function NotMeasuredCard({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1.5 rounded-lg border border-dashed border-sq-label p-6">
      <div className={`${EYEBROW} text-sq-label-paper`}>{title}</div>
      <div className="font-mono text-[40px] text-sq-label-paper" aria-label="not measured">—</div>
      <div className="text-[13px] text-sq-label-paper">{note}</div>
    </div>
  );
}

export default function SolomonPage() {
  return (
    <div
      data-theme="solomon"
      className="relative flex min-h-screen flex-col overflow-x-clip bg-sq-ground-ink font-sans text-sq-ink-paper"
    >
      {/* ── nav, a pill on ink ── */}
      <header className="flex justify-center px-4 py-4 sm:px-6">
        <nav className="flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-3 rounded-[28px] border border-sq-rule-ink bg-sq-card-ink py-2.5 pl-[18px] pr-2.5 sm:rounded-full">
          <div className="flex flex-wrap items-center gap-x-[22px] gap-y-2">
            <a href="#hero" className="flex items-center gap-2.5 text-sq-ink-paper">
              <img src={brand.spiralPaper} alt="" className="h-[22px] w-[22px]" />
              <span className="font-mono text-[17px] font-semibold">Solomon</span>
            </a>
            {[
              ["#how", "How it works"],
              ["#scale", "Ask → Task"],
              ["#surfaces", "Surfaces"],
              ["#measured", "Measured"],
              ["#road", "Roadmap"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="hidden text-sm text-sq-ink-muted-paper hover:text-sq-ink-paper lg:inline">
                {label}
              </a>
            ))}
            <a href={HOUSE_URL} className="font-mono text-[11px] tracking-[0.16em] text-sq-label-paper hover:text-sq-ink-paper">
              BY SQUALOO ↗
            </a>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#demo"
              className="hidden rounded-full border border-sq-label px-4 py-2.5 text-[13px] font-semibold text-sq-ink-paper sm:inline"
            >
              See the demo
            </a>
            <a href="#road" className="rounded-full bg-solomon-blue px-4 py-2.5 text-[13px] font-semibold text-on-solomon-blue">
              Deployment study
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* ── hero ── */}
        <section
          id="hero"
          className={`${WRAP} relative flex flex-wrap items-center gap-10 overflow-hidden pb-[72px] pt-16 md:pt-24`}
        >
          <img
            src={brand.octsqPanelPaper}
            alt=""
            className="pointer-events-none absolute -right-10 -top-[60px] hidden h-[760px] w-[560px] max-w-none object-cover opacity-[0.14] md:block"
          />
          <div className="relative flex min-w-0 flex-[1_1_520px] flex-col gap-[22px]">
            <Marker>For maintenance technicians · offline by design</Marker>
            <h1 className="m-0 flex flex-col items-start gap-2.5 font-mono text-[36px] font-medium leading-[1.12] sm:text-[48px] lg:text-[56px]">
              <span>Answers at the machine.</span>
              <Pill className="rounded-[10px] px-5 py-0.5">Offline.</Pill>
            </h1>
            <p className="m-0 max-w-[560px] text-[19px] leading-[1.55] text-sq-ink-muted-paper">
              Solomon keeps what the veteran knows and answers with it on hardware the plant owns. Every
              answer shows who said it and which page agrees; what the machine read is next. When the record doesn’t
              settle it, it says so. Any model that passes the ruler. Your data, in your custody.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <a href="#road" className="rounded-lg bg-solomon-blue px-5 py-3.5 text-[15px] font-semibold text-on-solomon-blue">
                Run a deployment study with us
              </a>
              <a href="#measured" className="rounded-lg border border-sq-label px-5 py-3.5 text-[15px] font-semibold text-sq-ink-paper">
                See the measurements
              </a>
              <a href="#how" className="pl-2 font-mono text-[13px] text-sq-label-paper hover:text-sq-ink-paper">
                How it works →
              </a>
            </div>
          </div>
          <div className="relative flex min-w-0 flex-[0_1_420px] flex-col gap-2.5 rounded-lg bg-sq-ground px-6 py-[22px] font-mono text-sm text-sq-ink">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold tracking-[0.12em]">CHECKED</span>
              <span className="text-[11px] text-sq-label">answer card · illustrative</span>
            </div>
            <div className="h-0.5 bg-sq-ink" />
            <ol className="m-0 list-none p-0 leading-[1.9]">
              <li>1 · Log: Ray, this morning</li>
              <li>2 · Cycle report, last run of this tool</li>
              <li>3 · OEM manual, probe ports</li>
              <li>4 · Nadcap deviation record</li>
            </ol>
            <div className="h-px bg-sq-label-paper" />
            <div className="flex items-center gap-2">
              {/* refused: the kit's blue square, with its words */}
              <span className="inline-block h-2.5 w-2.5 bg-solomon-blue" aria-hidden="true" />
              <span>Not settled → ask Ray</span>
            </div>
          </div>
        </section>

        {/* ── how it works ── */}
        <section id="how" className={`${WRAP} flex flex-col gap-6 pb-[72px] pt-6`}>
          <Marker>How it works</Marker>
          <h2 className="m-0 flex flex-wrap items-center gap-3 font-mono text-[26px] font-medium leading-[1.15] sm:text-[34px]">
            <span>One engine,</span>
            <Pill>three custody zones.</Pill>
          </h2>
          <div className="overflow-x-auto rounded-[10px] border border-sq-rule-ink bg-[#1d160c] px-5 pb-4 pt-5">
            <CustodyDiagram />
          </div>
          <div className="flex flex-wrap items-start gap-8">
            <p className="m-0 min-w-0 flex-[1_1_520px] text-[17px] leading-[1.6] text-sq-ink-muted-paper">
              The engine runs on a body at the site edge, offline, on hardware the customer owns: it captures
              what the veteran says, will read the export the controller already produces, and answers with the
              receipts attached. The customer’s tenant holds the Brain, where every word and every reading
              lives under the customer’s keys. Squaloo keeps only the measurement, content stripped. Any model
              that passes the ruler on the body, unmodified, is admissible; two models have been measured through it unmodified (2026-09-28).
            </p>
            <div className="flex min-w-0 flex-[0_1_300px] flex-col gap-2.5 font-mono text-[13px]">
              {["The full architecture →", "Bodies and budgets →", "The custody line →"].map((t) => (
                <a key={t} href="#how" className="rounded-lg border border-sq-label px-4 py-3 text-sq-ink-paper">
                  {t}
                </a>
              ))}
              <span className="text-[11px] text-sq-label-paper">
                Drawn from the architecture board, revised 2026-10-21. The detail pages return after the relaunch.
              </span>
            </div>
          </div>
        </section>

        {/* ── ask → task ── */}
        <section id="scale" className="relative overflow-hidden bg-solomon-blue text-on-solomon-blue">
          <img
            src={brand.octsqPanelPaper}
            alt=""
            className="pointer-events-none absolute -left-20 -top-[200px] h-[900px] w-[560px] max-w-none object-cover opacity-[0.18]"
          />
          <div className={`${WRAP} relative flex flex-col gap-6 py-20`}>
            <div className={`flex items-center gap-2.5 ${EYEBROW}`}>
              <img src={brand.tilePaper} alt="" className="h-3 w-3" />
              <span>The vision for the product</span>
            </div>
            <h2 className="m-0 flex flex-wrap items-center gap-3 font-mono text-[30px] font-medium leading-[1.12] sm:text-[44px]">
              <span>Ask scales to</span>
              <span className="rounded-[10px] bg-sq-ground px-4 text-solomon-blue">task.</span>
              <span className="text-[22px] text-[#c9d3f0] sm:pl-3 sm:text-[30px]">Edge scales to cloud.</span>
            </h2>
            <p className="m-0 max-w-[820px] text-lg leading-[1.55]">
              A verified answer today. A verified action next, with the same receipts. The layer that makes an
              answer verifiable is the layer that lets an agent act on the floor, and nothing about that layer
              depends on which model is behind it. Make a small model behave offline on a single-board computer and the
              discipline carries up to large models in the cloud.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2 rounded-lg bg-sq-ground p-6 text-sq-ink">
                <div className={`${EYEBROW} text-solomon-blue`}>Today · Ask</div>
                <div className="text-xl font-extrabold leading-[1.25]">A verified answer at the machine.</div>
                <div className="text-sm leading-normal text-sq-ink-muted">
                  Who said it, which page agrees. Refuses when the record doesn’t settle it. What the machine read is next.
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg border border-sq-ink-paper p-6">
                <div className={EYEBROW}>Next · Task</div>
                <div className="text-xl font-extrabold leading-[1.25]">A verified action at the machine.</div>
                <div className="text-sm leading-normal">
                  The same receipts on something that moves: a work order written, a step confirmed, a record filed.
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg border border-dashed border-sq-ink-paper p-6">
                <div className={EYEBROW}>Then · Edge to cloud</div>
                <div className="text-xl font-extrabold leading-[1.25]">Large models, the same binding.</div>
                <div className="text-sm leading-normal">
                  What the fleet teaches the orchestrator, content stripped: how a model binds to provenance where
                  it matters, so it can be trusted where it hasn’t been yet.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  k: "Model-agnostic by rule",
                  t: "Phi-3 today. Qwen through the unmodified gate. Gemma-class on the big body next. The ruler decides, never the vendor.",
                },
                {
                  k: "Custody by design",
                  t: "Your words and your readings stay in a Brain you hold. We keep the measurement, and only that.",
                },
                {
                  k: "The data nobody has",
                  t: "Compute, models and hardware are someone else’s race. The data from AI deployed where it matters, in its owner’s custody, is nobody’s yet. Solomon is built to be the middleware that collects it.",
                },
              ].map((c) => (
                <div key={c.k} className="flex flex-col gap-1 border-t border-sq-ink-paper pt-3.5">
                  <div className={EYEBROW}>{c.k}</div>
                  <div className="text-[15px] leading-normal">{c.t}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── surfaces ── */}
        <section id="surfaces" className={`${WRAP} flex flex-wrap items-center gap-10 py-[72px]`}>
          <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-[18px]">
            <h2 className="m-0 flex flex-wrap items-center gap-2.5 font-mono text-[26px] font-medium leading-[1.15] sm:text-[34px]">
              <span>Same engine.</span>
              <Pill>Any surface.</Pill>
            </h2>
            <p className="m-0 text-base leading-[1.55] text-sq-ink-muted-paper">
              A ruler and a chain of custody for your model and your data, wherever you need them. The engine is
              thin enough to go anywhere the floor already works, and the ruler goes with it.
            </p>
            <dl className="m-0 grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-[15px] leading-normal">
              {surfaces.map((s) => (
                <div key={s.name} className="contents">
                  <dt className={`font-semibold ${s.next ? "text-sq-label-paper" : ""}`}>{s.name}</dt>
                  <dd className={`m-0 ${s.next ? "text-sq-label-paper" : "text-sq-ink-muted-paper"}`}>{s.text}</dd>
                </div>
              ))}
            </dl>
            <div className="font-mono text-xs text-sq-label-paper">
              Your CMMS, the maintenance software where work orders live today, stays your CMMS. Solomon writes
              beside it, never in place of it.
            </div>
          </div>
          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-3 rounded-[10px] border border-sq-rule-ink bg-sq-card-ink p-[18px]">
            <div className="flex flex-wrap justify-between gap-2 font-mono text-[11px] text-sq-label-paper">
              <span>#equipment-line-1 · solomon</span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#3fb68b]" aria-hidden="true" />
                offline · body solomon-pi · illustrative
              </span>
            </div>
            <div className="rounded-md bg-sq-ground-ink p-3.5 text-sm leading-normal text-sq-ink-muted-paper">
              <span className="font-mono text-[11px] text-sq-label-paper">DEV · 06:41</span>
              <br />
              How do I tell a breather clog from a real leak before I abort this load?
            </div>
            <div className="flex flex-col gap-2 rounded-md border border-solomon-blue bg-sq-ground-ink p-3.5">
              <div className="font-mono text-[11px] text-sq-label-paper">SOLOMON · 06:42 · what I checked, in order</div>
              <div className="text-sm leading-normal text-sq-ink-muted-paper">
                [The answer, in the engine’s words, with the veteran’s note ranked where it belongs.]
              </div>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {["[Log: Ray 06:00]", "[Cycle report]", "[Manual §probe ports]"].map((t) => (
                  <span key={t} className="rounded bg-solomon-blue px-2 py-[3px] text-on-solomon-blue">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-sq-rule-ink pt-2.5 font-mono text-[11px] text-sq-label-paper">
              <span className="text-sq-ink-paper">● Chat</span>
              <span>Phone</span>
              <span>Touchscreen</span>
              <span>Voice</span>
              <span>CLI</span>
              <span>Library</span>
              <span>Agent</span>
            </div>
          </div>
        </section>

        {/* ── measured ── */}
        <section id="measured" className={`${WRAP} flex flex-wrap gap-5 pb-[72px]`}>
          <NotMeasuredCard
            title="Clean nightly runs"
            note="not published yet. It will be counted from committed artifacts, with its dates and machine."
          />
          <NotMeasuredCard
            title="Veteran fix leads the manual"
            note="not published yet. It will name its scenario, prompt and date."
          />
          <NotMeasuredCard title="Refusal class" note="not measured yet. Shown, not hidden." />
        </section>

        {/* ── the road to scale ── */}
        <section id="road" className={`${WRAP} flex flex-col gap-[18px] pb-20`}>
          <div className={`${EYEBROW} text-sq-label-paper`}>The road to scale</div>
          <h2 className="m-0 font-mono text-[22px] font-medium leading-[1.15] sm:text-[30px]">
            Engaging site partners now. The product shape and the business model get set with them.
          </h2>
          <div className="grid grid-cols-2 gap-2.5 font-mono text-[11px] tracking-[0.16em] md:grid-cols-4">
            <div className="border-t-[3px] border-[#3fb68b] pt-2.5 text-sq-label-paper">FINISH · DONE ON THE BENCH</div>
            <div className="border-t-[3px] border-solomon-blue pt-2.5 text-sq-ink-paper">ENGAGE · NOW</div>
            <div className="border-t-[3px] border-sq-rule-ink pt-2.5 text-sq-label-paper">STUDY · NEXT</div>
            <div className="border-t-[3px] border-sq-rule-ink pt-2.5 text-sq-label-paper">PUBLISH · THEN</div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2.5 rounded-lg border border-solomon-blue bg-sq-card-ink p-6">
              <div className="self-start rounded bg-solomon-blue px-2.5 py-1 font-mono text-xs text-on-solomon-blue">
                NOW · SITE PARTNERS
              </div>
              <div className="text-lg font-extrabold leading-[1.3]">
                We are talking to the industrials in our cited research about a deployment study.
              </div>
              <div className="text-sm leading-[1.6] text-sq-ink-muted-paper">
                Small models on your floor, offline, under the ruler, for a real shift. Two success criteria agreed
                up front. An FDE on site for the length of it. Everything measured, everything published.
              </div>
              <a
                href="#demo"
                className="mt-2 rounded-lg bg-solomon-blue px-4 py-3 text-center text-sm font-semibold text-on-solomon-blue"
              >
                Talk to us about a study →
              </a>
            </div>
            <div className="flex flex-col gap-2.5 rounded-lg border border-sq-rule-ink p-6">
              <div className="font-mono text-xs text-sq-label-paper">NEXT · THE STUDY</div>
              <div className="text-lg font-extrabold leading-[1.3]">The first field data on a model bound to provenance.</div>
              <div className="text-sm leading-[1.6] text-sq-ink-muted-paper">
                Time to the right first action. Record completeness. Refusal rate. How tightly the model binds to
                the record when a veteran and a manual disagree. Published with the misses.
              </div>
            </div>
            <div className="flex flex-col gap-2.5 rounded-lg border border-dashed border-sq-label p-6">
              <div className="font-mono text-xs text-sq-label-paper">THEN · SHAPE AND MODEL</div>
              <div className="text-lg font-extrabold leading-[1.3]">Product shape and business model, set from the data.</div>
              <div className="text-sm leading-[1.6] text-sq-ink-muted-paper">
                What a site pays for, and what unit it pays by, are answers the study gives us. We would rather
                learn them on a floor than assume them on a slide.
              </div>
            </div>
          </div>
        </section>

        {/* ── the demo, live (the radial closes the sequence) ── */}
        <section id="demo" className="relative overflow-hidden bg-solomon-blue text-on-solomon-blue">
          <img
            src={brand.radialArcsPaper}
            alt=""
            className="pointer-events-none absolute -right-[120px] -top-[120px] h-[560px] w-[560px] max-w-none object-contain opacity-30"
          />
          <div className={`${WRAP} relative flex flex-wrap items-end justify-between gap-6 py-[72px]`}>
            <div className="flex max-w-[640px] flex-col gap-3">
              <div className={EYEBROW}>The demo, live</div>
              <div className="font-display text-[28px] leading-[1.15] sm:text-4xl">
                We’ll run it with the network disconnected, for anyone who asks.
              </div>
              <div className="text-[15px]">
                A veteran’s note captured, synced once, the Wi-Fi killed on camera, a question answered with its
                receipts.
              </div>
            </div>
            <a
              href="mailto:marshal@squaloo.com"
              className="rounded-lg bg-sq-ground px-[22px] py-3.5 text-[15px] font-semibold text-solomon-blue"
            >
              marshal@squaloo.com
            </a>
          </div>
        </section>
      </main>

      <footer
        className={`${WRAP} flex flex-wrap items-center justify-between gap-4 py-10 font-mono text-xs text-sq-label-paper`}
      >
        <a href={HOUSE_URL} className="flex items-center gap-2.5 text-sq-label-paper hover:text-sq-ink-paper">
          <img src={brand.spiralPaper} alt="" className="h-5 w-5 shrink-0" />
          <span>
            Solomon by Squaloo · built on the bench, engaging site partners now · the product shape and business
            model will be set with them, and published
          </span>
        </a>
        <div className="flex gap-5">
          <a href="#measured" className="hover:text-sq-ink-paper">/measured</a>
          <a href="#how" className="hover:text-sq-ink-paper">/how-it-works</a>
          <a href="https://github.com/squaloo0" target="_blank" rel="noopener noreferrer" className="hover:text-sq-ink-paper">
            github
          </a>
        </div>
      </footer>
      <AppFooter register="solomon" />
    </div>
  );
}
