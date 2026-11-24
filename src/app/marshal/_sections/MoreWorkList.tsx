/**
 * "More work": the listed entries as a compact list: title, context, year,
 * one line, link if any. A thumbnail where the manifest has an image for the
 * entry.
 */
import Link from "next/link";
import CldImage from "../_components/CldImage";
import { MEDIA } from "../_data/media";
import { MORE_WORK } from "../_data/work";
import { MONO } from "../_components/styles";
import { Eyebrow, H2, WRAP } from "@/components/house/ui";

export default function MoreWorkList() {
  return (
    <section id="more" className="scroll-mt-20 border-t border-sq-rule">
      <div className={`${WRAP} flex flex-col gap-8 py-16 md:py-20`}>
        <div className="flex flex-col gap-3">
          <Eyebrow>More work</Eyebrow>
          <h2 className={H2}>Listed, not numbered.</h2>
        </div>
        <ul className="m-0 list-none divide-y divide-sq-rule border-y border-sq-rule p-0">
          {MORE_WORK.map((w) => {
            const title = <span className="text-[16px] font-semibold leading-[1.3] text-sq-ink">{w.title}</span>;
            return (
              <li key={w.title} className="flex gap-4 py-4">
                {w.image && (
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sq-sm border border-sq-rule bg-sq-ground">
                    <CldImage
                      src={MEDIA[w.image].id}
                      alt={MEDIA[w.image].alt}
                      width={56}
                      height={56}
                      sizes="56px"
                      className="h-full w-full object-cover"
                    />
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    {w.href ? (
                      w.href.startsWith("http") ? (
                        <a href={w.href} target="_blank" rel="noopener noreferrer" className="hover:text-solomon-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solomon-blue">
                          {title}
                          <span aria-hidden="true" className="ml-1 text-[13px] text-sq-label">↗</span>
                        </a>
                      ) : (
                        <Link href={w.href} className="hover:text-solomon-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solomon-blue">
                          {title}
                        </Link>
                      )
                    ) : (
                      title
                    )}
                    <span className={`${MONO} text-sq-label`}>{[w.context, w.year].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="text-[14px] leading-[1.5] text-sq-ink-muted">{w.line}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
