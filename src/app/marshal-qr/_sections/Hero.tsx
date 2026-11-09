/* eslint-disable @next/next/no-img-element -- the kit's linework is static SVG */
import Link from "next/link";
import { brand } from "@/lib/brand";
import { mailto } from "../_lib/meridian";
import { WRAP, Eyebrow } from "./ui";

export default function Hero() {
  return (
    <>
      <header className="border-b border-sq-rule">
        <nav className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3 text-sq-ink">
            <img src={brand.spiralInk} alt="" className="h-9 w-9" />
            <span className="font-display text-[30px] font-semibold tracking-[-0.02em]">Squaloo</span>
          </Link>
          <a
            href={mailto("Hello from Meridian")}
            className="inline-flex min-h-11 items-center rounded-full bg-sq-ink px-[18px] font-mono text-[13px] uppercase tracking-[0.1em] text-sq-ground hover:bg-solomon-blue"
          >
            Write to Marshal
          </a>
        </nav>
      </header>

      {/* jali band under the nav, in ink, low opacity: the same placement `/` uses (geometry.md) */}
      <div className="h-[56px] overflow-hidden border-b border-sq-rule opacity-[0.18] sm:h-[72px]" aria-hidden="true">
        <img src={brand.jaliBandInk} alt="" className="block h-[56px] w-[1440px] max-w-none object-cover sm:h-[72px]" />
      </div>

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
