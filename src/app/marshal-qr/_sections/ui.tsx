/* eslint-disable @next/next/no-img-element -- the kit's linework is static SVG; there is nothing to optimise */
/** Shared pieces of the Meridian front door, in the house register (brand kit v0.1, as `/` uses it). */
import { brand } from "@/lib/brand";

export const WRAP = "mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-12";
export const EYEBROW = "font-mono text-xs uppercase tracking-[0.22em] text-sq-label";
export const H2 = "m-0 font-display text-[32px] font-medium leading-[1.1] sm:text-[40px]";
/** 44px tall at least: a thumb at a conference table, holding a coffee. */
export const ACTION =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-sq-ink px-5 py-3 text-sm font-semibold text-sq-ground hover:bg-solomon-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solomon-blue";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2.5 ${EYEBROW}`}>
      <img src={brand.tileInk} alt="" className="h-3.5 w-3.5" />
      <span>{children}</span>
    </div>
  );
}
