/**
 * The bio: the substance of the old founder profile (who he is, founder of
 * Squaloo, MS candidate, seven years of enterprise systems, and its resume,
 * LinkedIn and GitHub links) under the mark-and-name header the sketch asks
 * for. The portrait sits in an arch frame, the kit's doorway motif.
 */
import CldImage from "../_components/CldImage";
import { HOME } from "../_data/home";
import { media } from "../_lib/cloudinary";
import { ACTION, Eyebrow, WRAP } from "@/components/house/ui";

const TEXTLINK =
  "inline-flex min-h-11 items-center rounded-full border border-sq-ink px-5 text-sm font-semibold text-sq-ink hover:border-solomon-blue hover:text-solomon-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solomon-blue";

export default function Bio() {
  const portrait = media(HOME.portrait);
  return (
    <section id="top" className={`${WRAP} grid scroll-mt-20 gap-10 pb-16 pt-10 md:grid-cols-12 md:gap-12 md:pb-24 md:pt-16`}>
      <div className="flex flex-col gap-6 md:col-span-7">
        <Eyebrow>{HOME.eyebrow}</Eyebrow>
        <h1 className="m-0 font-display text-[52px] font-medium leading-[1.02] tracking-[-0.01em] sm:text-[68px] lg:text-[80px]">{HOME.name}</h1>
        <p className="m-0 max-w-[36ch] font-display text-[24px] leading-[1.3] text-sq-ink-muted sm:text-[28px]">{HOME.claim}</p>
        <p className="m-0 max-w-[62ch] text-[17px] leading-[1.6] text-sq-ink-muted sm:text-lg">{HOME.bio}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a href="#take-phone" className={ACTION}>The Take Phone</a>
          {HOME.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={TEXTLINK}>
              {l.label}
              <span aria-hidden="true" className="ml-1.5">↗</span>
            </a>
          ))}
        </div>
      </div>
      <div className="md:col-span-5">
        <div className="mk-arch relative mx-auto aspect-[4/5] w-full max-w-[400px] overflow-hidden border border-sq-rule bg-sq-card">
          <CldImage
            src={portrait.id}
            alt={portrait.alt}
            fill
            sizes="(min-width: 768px) 400px, 90vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
