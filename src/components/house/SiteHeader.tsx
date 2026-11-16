/* eslint-disable @next/next/no-img-element -- the kit's linework is static SVG */
import Link from "next/link";
import { brand } from "@/lib/brand";
import { mailto } from "@/lib/mail";

export default function SiteHeader({ writeSubject }: { writeSubject: string }) {
  return (
    <>
      <header className="border-b border-sq-rule">
        <nav className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3 text-sq-ink">
            <img src={brand.spiralInk} alt="" className="h-9 w-9" />
            <span className="font-display text-[30px] font-semibold tracking-[-0.02em]">Squaloo</span>
          </Link>
          <a
            href={mailto(writeSubject)}
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
    </>
  );
}
