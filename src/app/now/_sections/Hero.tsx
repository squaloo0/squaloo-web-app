import { WRAP, Eyebrow } from "@/components/house/ui";

/** Rendered inside <main> (the page puts SiteHeader above it), so the hero sits in a landmark. */
export default function Hero() {
  return (
    <>
      <section id="top" className={`${WRAP} flex flex-col gap-6 pb-14 pt-12 md:pb-20 md:pt-20`}>
        <Eyebrow>Squaloo</Eyebrow>
        <h1 className="m-0 font-display text-[44px] font-medium leading-[1.04] sm:text-[60px] lg:text-[72px]">
          Own and verify your intelligence.
        </h1>
        <p className="m-0 max-w-[760px] text-lg leading-[1.55] text-sq-ink-muted sm:text-xl">
          <b className="text-solomon-blue">Solomon</b>, our first product, is a working prototype for maintenance
          technicians.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href="#talk"
            className="inline-flex min-h-11 items-center rounded-full bg-solomon-blue px-6 text-base font-semibold text-on-solomon-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solomon-blue"
          >
            Talk with us
          </a>
          <a
            href="#subscribe"
            className="inline-flex min-h-11 items-center rounded-full bg-[#e8e1cf] px-6 text-base font-semibold text-sq-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solomon-blue"
          >
            Follow the build
          </a>
        </div>
      </section>
    </>
  );
}
