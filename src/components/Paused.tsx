import Link from "next/link";

/**
 * A section paused until the relaunch (SQU-412). The founder's approach for the
 * live site, 2026-11-02: gate stale sections until the relaunch rather than
 * refresh them piecemeal.
 *
 * A paused section is replaced in place, never deleted quietly:
 *  - it says it is paused, and since when;
 *  - it says why, in one sentence a visitor can check;
 *  - where the section had a published version, that version stays at a dated
 *    URL, unedited (house principle 10: published records are corrected in
 *    public).
 *
 * Its look is the amber "true but not current" state, never the green of a
 * passing check.
 */
export const PAUSED_ON = "2026-11-02";

const AMBER = "#d98c5f";

export function PausedNote({ why, archiveHref }: { why: string; archiveHref?: string }) {
  return (
    <div className="border p-6 max-w-3xl" style={{ borderColor: `${AMBER}55` }} data-paused={PAUSED_ON}>
      <div className="text-xs font-mono tracking-widest uppercase mb-3" style={{ color: AMBER }}>
        Paused until the relaunch · {PAUSED_ON}
      </div>
      <p className="text-neutral-300 text-sm leading-relaxed">{why}</p>
      {archiveHref ? (
        <p className="text-neutral-500 text-sm leading-relaxed mt-3">
          As last published, unedited:{" "}
          <Link href={archiveHref} className="text-[#5688c7] hover:text-white transition-colors font-mono">
            {archiveHref}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

export default function PausedSection({
  title,
  why,
  archiveHref,
}: {
  title: string;
  why: string;
  archiveHref?: string;
}) {
  return (
    <section className="mb-32">
      <div className="flex items-baseline gap-4 mb-6 border-b border-neutral-800 pb-4">
        <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">{title}</h2>
        <div className="h-px flex-1 bg-neutral-800" />
        <span className="text-neutral-600 text-xs font-mono">paused {PAUSED_ON}</span>
      </div>
      <PausedNote why={why} archiveHref={archiveHref} />
    </section>
  );
}
