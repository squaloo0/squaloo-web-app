import { ASKS } from "../_data/asks";
import { mailto } from "../_lib/meridian";
import { WRAP, H2, ACTION, Eyebrow } from "./ui";

export default function Asks() {
  const booking = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();
  return (
    <section id="asks" className={`${WRAP} flex flex-col gap-6 py-16`}>
      <Eyebrow>The ask</Eyebrow>
      <h2 className={H2}>Four things I’m asking this room for.</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ASKS.map((a) => (
          <article key={a.n} className="flex flex-col gap-3 rounded-[20px] border border-sq-rule bg-sq-card p-6">
            <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-solomon-blue">
              {a.n} · {a.label}
            </div>
            <h3 className="m-0 text-xl font-extrabold leading-snug">{a.head}</h3>
            <p className="m-0 flex-1 leading-[1.55] text-sq-ink-muted">{a.body}</p>
            <div>
              <a href={mailto(a.subject)} className={ACTION}>
                {a.action}
              </a>
            </div>
          </article>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[13px] uppercase tracking-[0.14em]">
        <a href="https://www.linkedin.com/in/marshalaldoph/" className="inline-flex min-h-11 items-center text-sq-ink hover:text-solomon-blue">
          LinkedIn
        </a>
        {booking ? (
          <a href={booking} className="inline-flex min-h-11 items-center text-sq-ink hover:text-solomon-blue">
            Book a time
          </a>
        ) : null}
        <a href="mailto:marshal@squaloo.com" className="inline-flex min-h-11 items-center normal-case tracking-normal text-sq-ink hover:text-solomon-blue">
          marshal@squaloo.com
        </a>
      </div>
    </section>
  );
}
