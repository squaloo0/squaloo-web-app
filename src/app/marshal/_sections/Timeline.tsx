/**
 * The timeline: the seven numbered entries, oldest first, grouped under term
 * labels. Each is rendered by the one WorkEntry component from the data file.
 * The old page's #capabilities and #tracks anchors still resolve: #tracks
 * lands here and #capabilities on the section below.
 */
import WorkEntry from "../_components/WorkEntry";
import { TERMS, WORK } from "../_data/work";
import { media } from "../_lib/cloudinary";
import { Eyebrow, H2, WRAP } from "@/components/house/ui";

export default function Timeline() {
  return (
    <section id="work" className="scroll-mt-20 border-t border-sq-rule">
      <span id="tracks" className="block scroll-mt-20" aria-hidden="true" />
      <div className={`${WRAP} flex flex-col gap-12 py-16 md:py-24`}>
        <div className="flex flex-col gap-3">
          <Eyebrow>Work</Eyebrow>
          <h2 className={H2}>Seven entries, oldest first.</h2>
        </div>
        {TERMS.map((term) => {
          const entries = WORK.filter((w) => w.term === term);
          if (!entries.length) return null;
          return (
            <div key={term} className="flex flex-col gap-10">
              <h3 className="m-0 flex items-center gap-4 font-mono text-[12px] uppercase tracking-[0.2em] text-sq-label">
                <span>{term}</span>
                <span className="h-px flex-1 bg-sq-rule" aria-hidden="true" />
              </h3>
              {entries.map((e) => (
                <WorkEntry
                  key={e.slug}
                  entry={e}
                  items={[
                    ...e.media.map(media),
                    ...(e.links.video && !e.media.includes(e.links.video) ? [media(e.links.video)] : []),
                  ]}
                  priority={e.number === "001"}
                />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
