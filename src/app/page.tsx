/* eslint-disable @next/next/no-img-element -- the kit's linework is static SVG; there is nothing to optimise */
/**
 * squaloo.com, the house: brand/mockups/squaloo.html (kit v0.1), implemented.
 * Paper and ink; the blue only where it means Solomon (the name, the doorway).
 * Desktop follows the mockup's measurements; below `md` the type steps down and
 * the grids stack, so nothing scrolls sideways at phone width.
 *
 * Numbers: the mockup's [bracketed] placeholders are rendered in the kit's
 * "not measured" state (a dash, said in words) until the founder fills them
 * from a published, dated record. None is invented here.
 */
import Link from "next/link";
import AppFooter from "@/components/AppFooter";
import { brand } from "@/lib/brand";

export const metadata = {
  title: "Squaloo — Intelligence you own, and can verify.",
  description:
    "Squaloo builds sovereign, verifiable AI for the people who keep the world running, and the people building what comes next. Model-agnostic by rule. Your data in your custody, by design.",
};

const WRAP = "mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-12";
const EYEBROW = "font-mono text-xs uppercase tracking-[0.22em] text-sq-label";
const CARD_EYEBROW = "font-mono text-[11px] uppercase tracking-[0.2em]";

function Eyebrow({ children, tile = "ink" }: { children: React.ReactNode; tile?: "ink" | "paper" }) {
  return (
    <div className={`flex items-center gap-2.5 ${EYEBROW} ${tile === "paper" ? "text-sq-label-paper" : ""}`}>
      <img src={tile === "ink" ? brand.tileInk : brand.tilePaper} alt="" className="h-3.5 w-3.5" />
      <span>{children}</span>
    </div>
  );
}

const navLinks = [
  { href: "#scale", label: "The vision" },
  { href: "#build", label: "How we build" },
  { href: "#measured", label: "Measured" },
  { href: "#lineage", label: "Where we came from" },
];

const lineage = [
  {
    k: "The spiral · inside out",
    t: "Our ethos starts on the inside and works outward: the line a hand draws while it is thinking. Squaloo means “do you.” The method came before the product.",
  },
  {
    k: "Withered technology",
    t: "Mature, cheap, well-understood parts, used laterally: a credit-card-sized computer, a small open model, the export a controller already makes. Nothing exotic has to be true for Solomon to work.",
  },
  {
    k: "Dumb model theory",
    t: "Low-compute models doing jobs for bigger models, the way algebra builds the algorithm from simple parts. Small, exact, composable, and easy to put at the edge. That idea became Solomon.",
  },
];

/** A record row with nothing published behind it: the kit's "not measured" state. */
function NotPublished() {
  return (
    <span className="text-sq-label-paper">
      — <span className="sr-only">not measured: </span>not published
    </span>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-sq-ground font-sans text-sq-ink">
      {/* ── nav ── */}
      <header className="border-b border-sq-rule">
        <nav className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
          <a href="#top" className="flex items-center gap-3 text-sq-ink">
            <img src={brand.spiralInk} alt="" className="h-9 w-9" />
            <span className="font-display text-[30px] font-semibold tracking-[-0.02em]">Squaloo</span>
          </a>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 font-mono text-[13px] uppercase tracking-[0.14em]">
            <Link href="/solomon" className="text-solomon-blue hover:underline">
              Solomon
            </Link>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hidden text-sq-ink-muted hover:text-solomon-blue lg:inline">
                {l.label}
              </a>
            ))}
            <a
              href="#contact"
              className="rounded-full bg-sq-ink px-[18px] py-3 tracking-[0.1em] text-sq-ground hover:bg-solomon-blue"
            >
              Write to us
            </a>
          </div>
        </nav>
      </header>

      {/* jali band under the nav, in ink, low opacity (geometry.md placement table) */}
      <div className="h-[72px] overflow-hidden border-b border-sq-rule opacity-[0.18]" aria-hidden="true">
        <img src={brand.jaliBandInk} alt="" className="block h-[72px] w-[1440px] max-w-none object-cover" />
      </div>

      <main>
        {/* ── hero ── */}
        <section id="top" className={`${WRAP} flex flex-col gap-7 pb-20 pt-16 md:pt-24`}>
          <Eyebrow>Squaloo · who we are</Eyebrow>
          <h1 className="m-0 max-w-[900px] font-display text-[44px] font-medium leading-[1.04] sm:text-[60px] lg:text-[76px]">
            Intelligence you <span className="rounded-full bg-sq-sun px-3 sm:px-5">own</span>, and can verify.
          </h1>
          <p className="m-0 max-w-[760px] font-display text-xl leading-[1.45] text-sq-ink-muted sm:text-2xl">
            Squaloo builds sovereign, verifiable AI for the people who keep the world running, and the
            people building what comes next. Model-agnostic by rule. Your data in your custody, by design.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/solomon"
              className="rounded-full bg-solomon-blue px-6 py-4 text-base font-semibold text-on-solomon-blue"
            >
              Solomon, for maintenance technicians →
            </Link>
            <a href="#scale" className="rounded-full bg-[#e8e1cf] px-6 py-4 text-base font-semibold text-sq-ink">
              The vision to scale
            </a>
          </div>
        </section>

        {/* ── who we are, and the doorway ── */}
        <section id="solomon" className={`${WRAP} flex flex-wrap items-stretch gap-12 pb-24 pt-10`}>
          <div className="flex min-w-0 flex-[1_1_420px] flex-col justify-center gap-5">
            <div className={EYEBROW}>Who we are, and what we build</div>
            <h2 className="m-0 font-display text-[34px] font-medium leading-[1.1] sm:text-[44px]">
              Squaloo is who we are. <span className="text-solomon-blue">Solomon</span> is what we build.
            </h2>
            <p className="m-0 text-lg leading-[1.55] text-sq-ink-muted">
              <b>Squaloo</b> is the method: the mark, the ruler, the people, the records. It builds products
              for the people who keep the world running, publishes how each one is measured, and learns from
              the measurement.
            </p>
            <p className="m-0 text-lg leading-[1.55] text-sq-ink-muted">
              <b className="text-solomon-blue">Solomon</b> is the first: an answer layer for maintenance
              technicians. It keeps what the veteran knows and answers with it at the machine, offline, with
              what it checked. Wherever you see the blue, it means Solomon.
            </p>
            <Link
              href="/solomon"
              className="mt-2 self-start border-b-2 border-solomon-blue pb-0.5 font-mono text-sm tracking-[0.1em] text-solomon-blue"
            >
              Open /solomon →
            </Link>
          </div>

          {/* The doorway: the one arch on the page, where the house opens onto the product. */}
          <Link
            href="/solomon"
            className="relative flex min-h-[540px] min-w-0 flex-[1_1_420px] flex-col justify-end overflow-hidden rounded-[999px_999px_24px_24px] bg-solomon-blue p-7 text-on-solomon-blue sm:p-10"
          >
            <img
              src={brand.octsqPanelPaper}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
            <div className="relative flex flex-col gap-3.5">
              <div className="flex items-center gap-2 font-mono text-xs tracking-[0.2em]">
                <img src={brand.spiralPaper} alt="" className="h-[18px] w-[18px]" />
                <span>SOLOMON · BY SQUALOO</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 font-mono text-[26px] leading-[1.15] sm:text-[34px]">
                <span>Answers at the machine.</span>
                <span className="rounded-lg bg-sq-ground px-3.5 py-0.5 text-solomon-blue">Offline.</span>
              </div>
              <div className="text-base leading-normal">
                Every answer shows who said it and which page agrees. What the machine read is next.
              </div>
              <div className="self-start rounded-lg bg-sq-ground px-[18px] py-3 text-sm font-semibold text-solomon-blue">
                Step through the doorway →
              </div>
            </div>
          </Link>
        </section>

        {/* ── the vision to scale ── */}
        <section id="scale" className="bg-sq-ground-ink text-sq-ink-paper">
          <div className={`${WRAP} flex flex-col gap-7 py-20`}>
            <Eyebrow tile="paper">The vision to scale</Eyebrow>
            <h2 className="m-0 max-w-[900px] font-display text-[36px] font-medium leading-[1.1] sm:text-[48px]">
              Ask scales to task. Edge scales to cloud.
            </h2>
            <p className="m-0 max-w-[860px] text-lg leading-[1.55] text-sq-ink-muted-paper">
              The layer that makes an answer verifiable is the layer that will let an agent act on the floor.
              Make a small model behave offline, on hardware a plant owns, and the same discipline carries up
              to large models in the cloud. Compute, models and hardware are someone else’s race; the data
              from AI deployed where it matters, in its owner’s custody, is nobody’s yet. Solomon is the
              middleware that makes it collectable. Squaloo will orchestrate the measurement across sites, models
              and regulators, with every customer’s content stripped.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-0">
              <div className="flex flex-col gap-2 rounded-xl bg-solomon-blue p-[26px] md:rounded-r-none">
                <div className={CARD_EYEBROW}>Today · Ask</div>
                <div className="text-xl font-extrabold leading-[1.25]">A verified answer at the machine.</div>
                <div className="text-sm leading-normal text-sq-ink-muted-paper">
                  Who said it, which page agrees. What the machine read is next.
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-xl border-2 border-solomon-blue p-[26px] md:rounded-none">
                <div className={`${CARD_EYEBROW} text-sq-label-paper`}>Next · Task</div>
                <div className="text-xl font-extrabold leading-[1.25]">A verified action at the machine.</div>
                <div className="text-sm leading-normal text-sq-ink-muted-paper">
                  The same receipts, on something that moves.
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-xl border-2 border-sq-rule-ink p-[26px] md:rounded-l-none md:border-l-0">
                <div className={`${CARD_EYEBROW} text-sq-label-paper`}>Then · Edge to cloud</div>
                <div className="text-xl font-extrabold leading-[1.25]">Large models, the same binding.</div>
                <div className="text-sm leading-normal text-sq-ink-muted-paper">
                  Solve it where it is hardest and the discipline transfers upward.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  k: "Model-agnostic by rule",
                  t: "Any model that passes the ruler on the body, unmodified, is admissible. No vendor is load-bearing.",
                },
                {
                  k: "Custody by design",
                  t: "The customer keeps every word and every reading, in a Brain they hold. Squaloo keeps only the measurement.",
                },
                {
                  k: "Bound to provenance",
                  t: "We measure how tightly a model binds to the record, so it can be trusted in contexts nobody has deployed it in yet.",
                },
              ].map((c) => (
                <div key={c.k} className="flex flex-col gap-1.5 rounded-xl bg-sq-ground px-6 py-[22px] text-sq-ink">
                  <div className={`${CARD_EYEBROW} text-sq-label`}>{c.k}</div>
                  <div className="text-base leading-normal">{c.t}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── how we build ── */}
        <section id="build" className="border-b border-sq-rule bg-sq-card">
          <div className={`${WRAP} flex flex-col gap-7 py-20`}>
            <Eyebrow>How we build</Eyebrow>
            <h2 className="m-0 max-w-[820px] font-display text-[34px] font-medium leading-[1.1] sm:text-[44px]">
              A few exact rules, applied without exception.
            </h2>
            <p className="m-0 max-w-[860px] font-display text-[19px] leading-normal text-sq-ink-muted sm:text-[21px]">
              The geometers who built the great patterns worked with a compass, a straightedge and a handful
              of rules, and the culture they belonged to gave the world the word <i>algorithm</i>. What we take
              from them is the method, not the ornament. Keep the rules few, keep them exact, apply them
              without exception, and the result is correct; correct things tend to be beautiful, and beautiful
              things tend to feel safe, because they are. Solomon is built the same way: a short list of rules
              the engine enforces, measured every night, published with the misses.
            </p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                { t: "The receipt", d: "Every answer carries its sources. The engine attaches them; the model cannot author them.", edge: "border-t-sq-sun" },
                { t: "The ruler", d: "A published contract a model must satisfy, measured nightly on hardware we own, with the method to recompute every figure.", edge: "border-t-sq-sky" },
                { t: "The record", d: "Results published unedited, misses included. Where we were wrong, the correction is a dated row.", edge: "border-t-sq-green" },
              ].map((c) => (
                <div key={c.t} className={`flex flex-col gap-2.5 rounded-2xl border-t-[12px] bg-sq-ground p-7 ${c.edge}`}>
                  <h3 className="m-0 text-[22px] font-extrabold">{c.t}</h3>
                  <p className="m-0 text-base leading-[1.55] text-sq-ink-muted">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── measured ── */}
        <section id="measured" className={`${WRAP} flex flex-wrap items-center gap-10 py-20`}>
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4">
            <div className={EYEBROW}>Measured</div>
            <h2 className="m-0 font-display text-[32px] font-medium leading-[1.1] sm:text-[40px]">Don’t take our word for it.</h2>
            <p className="m-0 text-lg leading-[1.55] text-sq-ink-muted">
              The ruler runs every night. The numbers will land here, dated and scoped, with the method to re-run them.
            </p>
            <a
              href="#measured"
              className="self-start border-b-2 border-sq-ink pb-0.5 font-mono text-sm tracking-[0.1em] text-sq-ink"
            >
              The full ruler →
            </a>
          </div>
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5 rounded-2xl bg-sq-ground-ink p-7 font-mono text-sq-ink-paper">
            <div className="flex justify-between gap-4 text-xs tracking-[0.2em] text-sq-label-paper">
              <span>LATEST RECORD</span>
              <span>not published yet</span>
            </div>
            <dl className="m-0 grid grid-cols-2 gap-3 text-sm leading-[1.6]">
              <dt className="text-sq-label-paper">body</dt>
              <dd className="m-0"><NotPublished /></dd>
              <dt className="text-sq-label-paper">clean runs</dt>
              <dd className="m-0"><NotPublished /></dd>
              <dt className="text-sq-label-paper">verdict</dt>
              <dd className="m-0"><NotPublished /></dd>
              <dt className="text-sq-label-paper">not measured</dt>
              <dd className="m-0 text-sq-label-paper">— everything above, until the first dated record is published</dd>
            </dl>
          </div>
        </section>

        {/* ── where we came from ── */}
        <section id="lineage" className="border-t border-sq-rule bg-sq-card">
          <div className={`${WRAP} flex flex-col gap-7 py-20`}>
            <Eyebrow>Where we came from</Eyebrow>
            <h2 className="m-0 max-w-[820px] font-display text-[32px] font-medium leading-[1.1] sm:text-[40px]">
              An inside-out view, withered technology, and a theory about dumb models.
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {lineage.map((c) => (
                <div key={c.k} className="flex flex-col gap-2 rounded-lg border border-sq-rule bg-sq-ground p-[22px]">
                  <div className={`${CARD_EYEBROW} text-sq-label`}>{c.k}</div>
                  <div className="text-base font-extrabold leading-[1.3]">{c.t}</div>
                </div>
              ))}
              <div className="flex flex-col gap-2 rounded-lg border-2 border-solomon-blue bg-sq-ground p-[22px]">
                <div className={`${CARD_EYEBROW} text-solomon-blue`}>Now · Solomon</div>
                <div className="text-base font-extrabold leading-[1.3]">
                  The floor, where owning it and verifying it are already the rule. Two surfaces today, more next, and
                  a ruler that travels with the model.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── contact ── */}
      <footer id="contact" className={`${WRAP} flex flex-wrap items-end justify-between gap-6 pb-12 pt-16`}>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <img src={brand.spiralInk} alt="" className="h-7 w-7" />
            <span className="font-display text-2xl font-semibold">Squaloo</span>
          </div>
          <p className="m-0 text-[15px] text-sq-ink-muted">Intelligence you own, and can verify.</p>
        </div>
        <div className="flex flex-wrap gap-6 font-mono text-[13px] tracking-[0.1em]">
          <a href="mailto:marshal@squaloo.com" className="text-sq-ink hover:text-solomon-blue">marshal@squaloo.com</a>
          <a href="https://github.com/squaloo0" target="_blank" rel="noopener noreferrer" className="text-sq-ink hover:text-solomon-blue">
            github.com/squaloo0
          </a>
          <a href="#measured" className="text-sq-ink hover:text-solomon-blue">/measured</a>
          <Link href="/solomon" className="text-solomon-blue hover:underline">/solomon</Link>
        </div>
      </footer>
      <AppFooter register="squaloo" />
    </div>
  );
}
