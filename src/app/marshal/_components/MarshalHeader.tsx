/**
 * The portfolio header (SQU-461): the compact dragonfly mark beside the name,
 * as the sketch asks. The mark sits in `[data-mark-slot]`, which is where the
 * first-load intro lands the full figure (see MarkIntro).
 *
 * `home` carries the in-page anchors; `entry` carries the way back.
 */
import Link from "next/link";
import Mark from "./Mark";
import { mailto } from "@/lib/mail";

const NAV_LINK =
  "inline-flex min-h-11 items-center font-mono text-[12px] uppercase tracking-[0.14em] text-sq-ink hover:text-solomon-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solomon-blue";

export default function MarshalHeader({ variant }: { variant: "home" | "entry" }) {
  return (
    <header className="border-b border-sq-rule">
      <nav aria-label="Portfolio" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 sm:px-8 lg:px-12">
        <Link href="/marshal" className="flex items-center gap-3 text-sq-ink" aria-label="Marshal Aldoph, portfolio home">
          <span data-mark-slot className="block h-11 w-11 shrink-0">
            <Mark variant="compact" decorative className="h-full w-full" />
          </span>
          <span className="font-display text-[24px] font-semibold tracking-[-0.01em] sm:text-[28px]">Marshal Aldoph</span>
        </Link>
        <div className="flex items-center gap-5">
          {variant === "home" ? (
            <>
              <a href="#work" className={NAV_LINK}>Work</a>
              <a href="#capabilities" className={NAV_LINK}>Capabilities</a>
            </>
          ) : (
            <Link href="/marshal#work" className={NAV_LINK}>
              <span aria-hidden="true" className="mr-1.5">←</span>All work
            </Link>
          )}
          <a
            href={mailto("From your portfolio")}
            className="inline-flex min-h-11 items-center rounded-full bg-sq-ink px-[18px] font-mono text-[12px] uppercase tracking-[0.1em] text-sq-ground hover:bg-solomon-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solomon-blue"
          >
            Write
          </a>
        </div>
      </nav>
    </header>
  );
}
