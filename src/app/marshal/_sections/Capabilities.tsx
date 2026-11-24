/**
 * Capabilities: the three self-rated pillars carried from the old founder
 * profile, kept compact. Self-ratings are the founder's own copy; revisit
 * with him before changing a level (TODO(marshal)).
 */
import { HOME } from "../_data/home";
import { MONO } from "../_components/styles";
import { Eyebrow, H2, WRAP } from "@/components/house/ui";

export default function Capabilities() {
  return (
    <section id="capabilities" className="scroll-mt-20 border-t border-sq-rule">
      <div className={`${WRAP} flex flex-col gap-8 py-16 md:py-20`}>
        <div className="flex flex-col gap-3">
          <Eyebrow>Capabilities</Eyebrow>
          <h2 className={H2}>Three pillars, self-rated.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {HOME.capabilities.map((c) => (
            <div key={c.title} className="flex flex-col gap-4 rounded-sq-md border border-sq-rule bg-sq-card p-5 sm:p-6">
              <div className="flex gap-1.5" role="img" aria-label={`Level ${c.level} of ${c.maxLevel}`}>
                {Array.from({ length: c.maxLevel }, (_, i) => (
                  <span key={i} className={`h-1 w-6 rounded-full ${i < c.level ? "bg-sq-ink" : "bg-sq-rule"}`} />
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="m-0 font-sans text-[18px] font-extrabold leading-[1.25] text-sq-ink">{c.title}</h3>
                <p className={`m-0 ${MONO} text-sq-label`}>{c.proficiency}</p>
              </div>
              <ul className="m-0 mt-auto flex list-none flex-wrap gap-1.5 p-0">
                {c.keywords.map((k) => (
                  <li key={k} className="rounded-full border border-sq-rule px-2.5 py-1 font-mono text-[11px] leading-[1.3] text-sq-ink-muted">
                    {k}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
