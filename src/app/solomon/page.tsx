import Link from "next/link";
import AppFooter from "@/components/AppFooter";
import SolomonTranscript from "@/components/SolomonTranscript";
import VideoEmbed from "@/components/VideoEmbed";
import Wordmark from "@/components/Wordmark";

export const metadata = {
  title: "Solomon — by Squaloo",
  description:
    "The AI teammate for the places the cloud can't reach. Offline, on-site, cited answers from your veterans' knowledge and your manuals.",
};

const acts = [
  {
    n: "ACT 01",
    title: "Capture — no forms, no friction",
    text: "Veterans record what they know by typing it the way they'd say it. Manuals get dropped in as PDFs — layout, tables, and section structure preserved. Solomon confirms what it understood, names the machine and the fault, and indexes everything locally. Re-upload a document and it says \"updated,\" not duplicated.",
  },
  {
    n: "ACT 02",
    title: "Sync — One Brain, Two Bodies",
    text: "Squaloo's OB2B protocol moves knowledge between headquarters and the device beside the machine — differential, verified, and honest: every sync posts a receipt with real counts, and a failed sync says so. No cloud dependence, ever.",
  },
  {
    n: "ACT 03",
    title: "Answer — cited, safety-first, offline",
    text: "A technician asks in plain English. Seconds later: numbered steps, lockout first, citing the manual section AND the veteran's logged fix — including when the veteran's experience overrules the manual's official procedure. No sources found? Solomon says so instead of guessing.",
  },
];

const metrics = [
  { value: "~7s", label: "to a cited answer, measured warm — median 7.5s across 14 runs, 2026-09-05" },
  { value: "100%", label: "offline — verified with the network disconnected, 2026-09-05" },
  { value: "6GB", label: "the single-board computer's budget. Each machine now has its own — a laptop and a credit-card-sized computer are not the same promise (2026-09-27)" },
  { value: "0", label: "cloud services in the answer path — nothing to reprice, nothing to leak" },
];

const guarantees = [
  "Citations enforced by architecture — every answer carries its sources; traceability isn't left to the model's discretion.",
  "Honest refusals — no documentation, no answer. Solomon never bluffs a repair procedure.",
  "Compliance by design — data never leaves the facility, built for environments where that's non-negotiable.",
  "Vendor-independent — open model weights we run ourselves. When one API vendor repriced overnight, we deleted the dependency in an afternoon.",
];

export default function SolomonPage() {
  return (
    <div className="min-h-screen bg-[#08090a] text-white flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-1.5 text-neutral-600 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">
            ← <Wordmark className="h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </Link>
          <div className="flex items-center gap-6">
            <a href="#how" className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">How</a>
            <a href="#proof" className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">Proof</a>
            <a href="#demo" className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">Demo</a>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 pt-36 pb-24 flex-1 w-full">
        {/* ── HERO ── */}
        <section className="mb-24">
          <div className="text-xs text-neutral-500 font-mono tracking-[0.3em] uppercase mb-6">
            Solomon — by Squaloo
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 max-w-3xl">
            How do you <span className="text-[#5688c7]">know?</span><br />
            What did you <span className="text-[#5688c7]">check?</span>
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mb-5">
            Two questions you cannot ask most AI. Solomon is{" "}
            <Link href="/" className="text-[#5688c7] hover:text-white transition-colors">the trust and verification layer</Link>{" "}
            that makes both answerable, and it does three things to get there:{" "}
            <span className="text-white">your knowledge stays on hardware you own</span>;{" "}
            <span className="text-white">questions are answered on that same hardware</span>, with no
            line back to anyone&apos;s servers; and{" "}
            <span className="text-white">every answer arrives with its sources attached</span> — saying
            plainly when it could not check one, because could-not-check and not-there are different
            answers.
          </p>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mb-5">
            Its first use case is industrial operations. Verification there is already legally
            mandatory, the buildings are places the cloud cannot legally or physically reach, and the
            reader is a technician at a stopped machine deciding whether to trust an answer before
            acting on it. If the layer holds anywhere, it has to hold there first.
          </p>
          <SolomonTranscript />
          <p className="text-neutral-600 text-xs mt-3 font-mono">
            Struck through: the manual&apos;s official answer — a six-hour teardown of the wrong part.
            Overruled by three sentences a veteran typed ten minutes earlier.
          </p>
        </section>

        {/* ── HOW ── */}
        <section id="how" className="mb-32">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">The layer, applied to a plant floor</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl mb-10">
            Custody, on-site answering and checkable sources are general properties. Here is what
            they look like pointed at one problem — a retiring workforce, machines that stop, and a
            building with no usable connection. Three steps, each one a piece of the layer doing a
            job somebody on that floor actually has.
          </p>
          <div className="space-y-0">
            {acts.map((a) => (
              <div key={a.n} className="group border-t border-neutral-800 py-8 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 hover:border-[#1400bf] transition-colors">
                <span className="text-neutral-600 text-xs font-mono tracking-widest pt-1 w-16 group-hover:text-[#5688c7] transition-colors">{a.n}</span>
                <div>
                  <div className="text-white text-lg tracking-wide mb-2">{a.title}</div>
                  <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">{a.text}</p>
                </div>
              </div>
            ))}
            <div className="border-t border-neutral-800" />
          </div>
        </section>

        {/* ── PROOF ── */}
        <section id="proof" className="mb-32">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">What the first tests show</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {metrics.map((m) => (
              <div key={m.label} className="border border-neutral-800 p-6 hover:border-[#63a375] transition-colors">
                <div className="text-3xl font-bold font-mono text-[#63a375] mb-2">{m.value}</div>
                <p className="text-neutral-400 text-xs leading-relaxed">{m.label}</p>
              </div>
            ))}
          </div>
          <p className="text-neutral-400 text-sm max-w-3xl leading-relaxed mb-4">
            These are early results, and we label them that way on purpose. They test one thing: whether
            the layer is viable for this first use case. Measured live, August–September 2026 — knowledge
            captured in conversation, synced to the device, the network disconnected, and a junior
            technician&apos;s question answered with its sources attached. Measured, not estimated, and
            each figure carries the date it was true.
          </p>
          <p className="text-neutral-500 text-sm max-w-3xl leading-relaxed mb-4">
            What they do not yet show: a wide corpus, many machines, or many technicians. The scripted
            question set is small and we say so wherever we quote it. As the work gets more concrete
            these numbers change — and when they do, the old ones stay on the measurements page with
            their dates rather than disappearing.
          </p>
          <p className="text-neutral-500 text-sm max-w-3xl leading-relaxed mb-10">
            We publish the full scorecard — including the questions Solomon still gets wrong, dated
            and linked to the fix.{" "}
            <Link href="/measured" className="text-[#5688c7] hover:text-white transition-colors">
              See the measurements →
            </Link>
          </p>
          <div className="space-y-4">
            {guarantees.map((g) => (
              <div key={g} className="flex gap-4 items-start">
                <span className="text-[#63a375] font-mono text-sm pt-0.5">✓</span>
                <p className="text-neutral-300 text-sm leading-relaxed max-w-3xl">{g}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── THE THREE QUESTIONS (moved here from the homepage — product-level) ── */}
        <section className="mb-32 border-l-2 border-[#1400bf] pl-8 py-2">
          <div className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-4">The three questions</div>
          <p className="text-neutral-300 text-base leading-relaxed max-w-3xl mb-5">
            <span className="text-white">How do you know?</span> — every answer carries its sources, and says
            plainly when it could not check one, because &ldquo;could not check&rdquo; is not the same as &ldquo;not there&rdquo;.
            <span className="text-white"> Where does it live?</span> — your building, your box, your keys; cut
            the cord and nothing stops working.
            <span className="text-white"> Who is checking?</span> — not us. A published ruler, measured nightly,
            that anyone can re-run, including on us.
          </p>
          <p className="text-neutral-300 text-base leading-relaxed max-w-3xl">
            We believe the binding underneath works for any model — and we have
            <span className="text-white"> scheduled the experiment that could prove us wrong</span>. We will
            publish that result whichever way it goes.
          </p>
        </section>

        {/* ── THE ASTERISK ── */}
        <section className="mb-32 border-l-2 border-[#1400bf] pl-8 py-2">
          <div className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-4">Where is the disruption?</div>
          <p className="text-neutral-300 text-base leading-relaxed max-w-3xl">
            Cloud connected-worker platforms promise AI teammates — <span className="text-white">with an asterisk</span>:
            requires connectivity, expands your compliance boundary into their cloud, and rides on a model vendor
            who can reprice overnight. Solomon is everything they promise, <span className="text-white">minus the asterisk</span>.
          </p>
        </section>

        {/* ── DEMO ── */}
        <section id="demo" className="mb-32">
          <div className="flex items-baseline gap-4 mb-8 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">The 60-second demo</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <VideoEmbed
            id="wo8VvI6iR-w"
            title="Solomon Demo v1.0 — capture, sync, and a cited answer with the Wi-Fi cut"
            poster="/video/solomon-demo-poster.jpg"
            caption="Recorded 2026-09-04. Nothing loads from YouTube until you press play."
          />
        </section>

        {/* ── CTA ── */}
        <section className="border border-neutral-800 p-10">
          <div className="text-xs font-mono tracking-widest uppercase text-[#63a375] mb-4">Get in touch</div>
          <p className="text-neutral-300 text-lg leading-relaxed max-w-3xl mb-8">
            If any of this is useful to you — a facility with machines that cannot afford to forget,
            a question about how the verification actually works, or a claim on this page you want to
            check — write to us. We answer technical questions with the artifact attached, and we will
            run the demo live, on a machine with its network disconnected, for anyone who asks.
          </p>
          <a href="mailto:marshal@squaloo.com?subject=Solomon" className="inline-block px-6 py-3 bg-[#1400bf] text-white text-sm font-medium tracking-wide hover:bg-[#5688c7] transition-colors">
            marshal@squaloo.com
          </a>
        </section>
      </div>

      <AppFooter />
    </div>
  );
}
