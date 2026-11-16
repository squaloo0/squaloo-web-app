import AskCards from "@/components/house/AskCards";
import { WRAP, H2, Eyebrow } from "@/components/house/ui";

export default function Asks() {
  const booking = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();
  return (
    <section id="asks" className={`${WRAP} flex flex-col gap-6 py-16`}>
      <Eyebrow>The ask</Eyebrow>
      <h2 className={H2}>Four things I’m asking this room for.</h2>
      <AskCards />
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
