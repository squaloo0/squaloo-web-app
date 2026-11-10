import { WRAP, EYEBROW, H2 } from "./ui";

const THINGS = [
  { k: "Ask it something", t: "Ask Solomon a question with the Wi‑Fi off, and see what it checked before it answered." },
  { k: "Scan the board", t: "The go board on the table is a working QR code. It’s how you got here." },
  { k: "Take a card", t: "The ask card has the four asks and a way to reach me after today." },
];

/** Dated on purpose: after the expo closes, this section is a record of the day, not an invitation. */
export default function AtTheTable() {
  return (
    <section id="table" className="border-y border-sq-rule bg-sq-card">
      <div className={`${WRAP} flex flex-col gap-6 py-14`}>
        <div className={EYEBROW}>At the table · Sat Nov 14 · the expo, until 2:40 PM</div>
        <h2 className={H2}>Three things to do at the Squaloo table.</h2>
        <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3">
          {THINGS.map((x, i) => (
            <li key={x.k} className="flex flex-col gap-2 rounded-2xl border border-sq-rule bg-sq-ground p-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-sq-label">0{i + 1}</span>
              <span className="text-lg font-extrabold leading-snug">{x.k}</span>
              <span className="leading-[1.55] text-sq-ink-muted">{x.t}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
