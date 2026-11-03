/**
 * Two dated notes for the pre-relaunch pages (2026-11-02), drawn in the kit's
 * states rather than a borrowed safety color: an archived page is "not
 * current" (dashed outline, the state-unknown treatment), and a withdrawn
 * claim stays visible, struck, beside the date and the reason. Absence is
 * drawn, never left blank (brand/kit/README.md, section 7).
 */
import Link from "next/link";

const LABEL = "#c9c1ad"; // kit `label`, Solomon (ink) theme
const INK = "#f7f3e8"; // kit `ink`, Solomon (ink) theme

export function ArchiveBanner({
  retired,
  replacedBy,
  replacedByLabel,
}: {
  retired: string;
  replacedBy: string;
  replacedByLabel: string;
}) {
  return (
    <aside
      className="mb-16 rounded-lg border border-dashed p-5 font-sans text-sm leading-relaxed"
      style={{ borderColor: LABEL, color: LABEL }}
    >
      <div className="mb-2 font-mono text-xs uppercase tracking-[0.2em]" style={{ color: INK }}>
        Archived · {retired} · not current
      </div>
      This page is kept as it was last published, so links to it still resolve and the record stays
      readable. It is not maintained, and its figures describe the dates printed beside them, not
      today. The current page is{" "}
      <Link href={replacedBy} className="underline underline-offset-4" style={{ color: INK }}>
        {replacedByLabel}
      </Link>
      .
    </aside>
  );
}

export function Withdrawn({
  date,
  children,
  why,
}: {
  date: string;
  /** The withdrawn words, kept readable. */
  children: React.ReactNode;
  /** Why it was withdrawn, in plain words. No figure without its scope. */
  why: React.ReactNode;
}) {
  return (
    <span className="block rounded-lg border border-dashed p-4" style={{ borderColor: LABEL }}>
      <span className="mb-2 block font-mono text-xs uppercase tracking-[0.2em]" style={{ color: INK }}>
        Withdrawn · {date}
      </span>
      <del className="block" style={{ color: LABEL }}>
        {children}
      </del>
      <span className="mt-2 block text-sm leading-relaxed" style={{ color: LABEL }}>
        {why}
      </span>
    </span>
  );
}
