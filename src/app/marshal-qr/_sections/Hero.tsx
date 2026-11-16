import Link from "next/link";
import SiteHeader from "@/components/house/SiteHeader";
import { WRAP, Eyebrow } from "@/components/house/ui";

export default function Hero() {
  return (
    <>
      <SiteHeader writeSubject="Hello from Meridian" />

      <section id="top" className={`${WRAP} flex flex-col gap-6 pb-14 pt-12 md:pb-20 md:pt-20`}>
        <Eyebrow>Meridian · UCLA · Saturday, November 14, 2026</Eyebrow>
        <h1 className="m-0 font-display text-[44px] font-medium leading-[1.04] sm:text-[60px] lg:text-[72px]">
          You scanned a go board.
        </h1>
        <p className="m-0 max-w-[760px] font-display text-xl leading-[1.45] text-sq-ink-muted sm:text-2xl">
          I’m Marshal Aldoph, founder of Squaloo and an MS candidate at the USC Iovine and Young Academy.
        </p>
        <p className="m-0 max-w-[760px] text-lg leading-[1.55] text-sq-ink-muted">
          Squaloo builds <b className="text-solomon-blue">Solomon</b>: answers at the machine, offline. AI the plant
          owns, that shows what it checked.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <a href="#asks" className="inline-flex min-h-11 items-center rounded-full bg-solomon-blue px-6 text-base font-semibold text-on-solomon-blue">
            The four asks
          </a>
          <Link href="/solomon" className="inline-flex min-h-11 items-center rounded-full bg-[#e8e1cf] px-6 text-base font-semibold text-sq-ink">
            What Solomon is →
          </Link>
        </div>
      </section>
    </>
  );
}
