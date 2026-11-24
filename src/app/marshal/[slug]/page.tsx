/**
 * /marshal/[slug]: entry pages. Only entries with `page: true` get one, and
 * `dynamicParams = false` 404s everything else. The `type` field selects the
 * template: "gallery" renders the long scroll below; "howto" is a typed option
 * with no template yet and no page using it, so it 404s for now.
 *
 * The only gallery page in v1 is /marshal/take-phone (the graded page). Its
 * copy lives in ../_data/take-phone.ts; this file is layout only.
 */
import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import MarshalHeader from "../_components/MarshalHeader";
import MarshalFooter from "../_components/MarshalFooter";
import CldImage from "../_components/CldImage";
import type { MediaKey } from "../_data/media";
import { media } from "../_lib/cloudinary";
import { TAKE_PHONE, type Block } from "../_data/take-phone";
import { WORK } from "../_data/work";
import { humanSize } from "@/lib/size";
import { ACTION, Eyebrow, H2, WRAP } from "@/components/house/ui";
import { MONO, TEXT_LINK } from "../_components/styles";

export const dynamicParams = false;

export function generateStaticParams() {
  return WORK.filter((w) => w.page).map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = WORK.find((w) => w.slug === slug && w.page);
  if (!entry || slug !== "take-phone") return {};
  const title = `${TAKE_PHONE.title} · Marshal Aldoph`;
  const description = TAKE_PHONE.description;
  return {
    title,
    description,
    alternates: { canonical: `/marshal/${slug}` },
    openGraph: { title, description, url: `/marshal/${slug}`, siteName: "Squaloo", type: "article" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

function Figure({ mediaKey, caption, wide, priority }: { mediaKey: MediaKey; caption?: string; wide?: boolean; priority?: boolean }) {
  const m = media(mediaKey);
  return (
    <figure className={`m-0 flex flex-col gap-3 ${wide ? "lg:-mx-8" : "max-w-[860px]"}`}>
      <div className="overflow-hidden rounded-sq-md border border-sq-rule bg-sq-card">
        <CldImage
          src={m.id}
          alt={m.alt}
          width={m.width}
          height={m.height}
          sizes={wide ? "(min-width: 1280px) 1244px, 96vw" : "(min-width: 1024px) 860px, 92vw"}
          className="h-auto w-full"
          priority={priority}
        />
      </div>
      {caption && <figcaption className="text-[14px] leading-[1.5] text-sq-ink-muted">{caption}</figcaption>}
    </figure>
  );
}

function renderBlock(b: Block, key: number, first: boolean) {
  switch (b.kind) {
    case "p":
      return <p key={key} className="m-0 max-w-[68ch] text-[17px] leading-[1.65] text-sq-ink-muted sm:text-[18px]">{b.text}</p>;
    case "figure":
      return <Figure key={key} mediaKey={b.media} caption={b.caption} wide={b.wide} priority={first} />;
    case "math":
      return (
        <div key={key} className="flex max-w-[640px] flex-col rounded-sq-md border border-sq-rule bg-sq-card p-5 sm:p-6">
          {b.title && <div className={`${MONO} pb-3 text-sq-label`}>{b.title}</div>}
          {b.rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-4 border-b border-sq-rule py-2.5">
              <span className="text-[15px] leading-[1.4] text-sq-ink-muted">
                {r.label}
                {r.note && <span className={`${MONO} ml-2 rounded-full bg-sq-sun px-2 py-0.5 text-[10px] text-sq-on-sun`}>{r.note}</span>}
              </span>
              <span className="shrink-0 font-mono text-[15px] text-sq-ink">{r.value}</span>
            </div>
          ))}
          {b.result && <div className="pt-3 font-mono text-[15px] font-semibold text-sq-ink sm:text-[16px]">{b.result}</div>}
        </div>
      );
    case "columns":
      return (
        <div key={key} className="grid gap-4 sm:grid-cols-2 lg:-mx-8 lg:grid-cols-5">
          {b.items.map((c) => (
            <div key={c.title} className="flex flex-col gap-3 rounded-sq-md border border-sq-rule bg-sq-card p-4">
              <div className={`${MONO} text-sq-ink`}>{c.title}</div>
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[14px] leading-[1.4] text-sq-ink-muted">
                {c.points.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      );
    case "list":
      return (
        <ul key={key} className="m-0 flex max-w-[68ch] list-disc flex-col gap-2 pl-5 text-[17px] leading-[1.6] text-sq-ink-muted">
          {b.items.map((i) => <li key={i}>{i}</li>)}
        </ul>
      );
    case "table":
      return (
        <div key={key} className="flex flex-col gap-3 lg:-mx-8">
          <div className="overflow-x-auto rounded-sq-md border border-sq-rule bg-sq-card" tabIndex={0} role="region" aria-label={b.caption}>
            <table className="w-full min-w-[720px] border-collapse text-left text-[14px] leading-[1.4]">
              <caption className="sr-only">{b.caption}</caption>
              <thead>
                <tr>
                  {b.head.map((h, i) => (
                    <th key={h} scope="col" className={`${MONO} border-b border-sq-rule px-3 py-3 align-bottom ${i === 1 ? "bg-sq-sun/25 text-sq-ink" : "text-sq-label"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-sq-rule last:border-b-0">
                    {row.map((cell, i) =>
                      i === 0 ? (
                        <th key={i} scope="row" className="px-3 py-2.5 font-semibold text-sq-ink">{cell}</th>
                      ) : (
                        <td key={i} className={`px-3 py-2.5 ${i === 1 ? "bg-sq-sun/25 italic text-sq-ink" : "text-sq-ink-muted"}`}>{cell}</td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {b.note && <p className="m-0 text-[13px] leading-[1.5] text-sq-label">{b.note}</p>}
        </div>
      );
    case "callout":
      return (
        <p key={key} className="m-0 border-l-[3px] border-sq-ink pl-5 font-display text-[26px] font-medium leading-[1.25] text-sq-ink sm:text-[32px]">
          {b.text}
        </p>
      );
  }
}

export default async function EntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = WORK.find((w) => w.slug === slug && w.page);
  if (!entry) notFound();
  if (entry.type !== "gallery" || slug !== "take-phone") notFound(); // howto: typed, no template yet

  const tp = TAKE_PHONE;
  const hero = media(tp.hero);
  const size = humanSize(fs.statSync(path.join(process.cwd(), "public", tp.deck)).size);

  return (
    <div className="mk-root flex min-h-screen flex-col bg-sq-ground font-sans text-sq-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-sq-ink focus:px-5 focus:py-3 focus:text-sq-ground">Skip to content</a>
      <MarshalHeader variant="entry" />
      <main id="main" className="flex-1">
        <article>
          <header className={`${WRAP} flex flex-col gap-5 pb-10 pt-10 md:pt-16`}>
            <Eyebrow>#{entry.number} · {entry.context} · {entry.term}</Eyebrow>
            <h1 className="m-0 font-display text-[48px] font-medium leading-[1.02] tracking-[-0.01em] sm:text-[64px] lg:text-[76px]">{tp.title}.</h1>
            <p className="m-0 max-w-[36ch] font-display text-[24px] leading-[1.25] text-sq-ink-muted sm:text-[30px]">{tp.tagline}</p>
          </header>
          <figure className={`${WRAP} m-0`}>
            <div className="overflow-hidden rounded-sq-lg border border-sq-rule bg-sq-card">
              <CldImage src={hero.id} alt={hero.alt} width={hero.width} height={hero.height} sizes="(min-width: 1280px) 1180px, 96vw" className="h-auto w-full" priority />
            </div>
          </figure>
          <dl className={`${WRAP} m-0 mt-10 grid gap-x-10 gap-y-5 border-y border-sq-rule py-6 sm:grid-cols-2 lg:grid-cols-4`}>
            <div className="flex flex-col gap-1.5"><dt className={`${MONO} text-sq-label`}>Organization</dt><dd className="m-0 text-[15px] leading-[1.5] text-sq-ink">USC Iovine and Young Academy, {entry.context}, {entry.term}</dd></div>
            <div className="flex flex-col gap-1.5"><dt className={`${MONO} text-sq-label`}>Team</dt><dd className="m-0 text-[15px] leading-[1.5] text-sq-ink">{tp.team.join(", ")}</dd></div>
            <div className="flex flex-col gap-1.5"><dt className={`${MONO} text-sq-label`}>My role</dt><dd className="m-0 text-[15px] leading-[1.5] text-sq-ink">{entry.role}</dd></div>
            <div className="flex flex-col gap-1.5"><dt className={`${MONO} text-sq-label`}>Format</dt><dd className="m-0 text-[15px] leading-[1.5] text-sq-ink">Birds of a Feather semester project, presented in class, Fall 2026</dd></div>
          </dl>
          <div className={`${WRAP} flex flex-col gap-20 pb-24 pt-16 md:gap-28`}>
            {tp.sections.map((s, si) => {
              let firstFigure = si === 0;
              return (
                <section key={s.id} id={s.id} className="flex scroll-mt-24 flex-col gap-7" aria-labelledby={`${s.id}-h`}>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Eyebrow>{s.label}</Eyebrow>
                      {s.credit && <span className={`${MONO} rounded-full bg-sq-sun px-3 py-1 text-sq-on-sun`}>{s.credit}</span>}
                    </div>
                    <h2 id={`${s.id}-h`} className={H2}>{s.heading}</h2>
                  </div>
                  {s.blocks.map((b, i) => {
                    const isFig = b.kind === "figure";
                    const node = renderBlock(b, i, isFig && firstFigure);
                    if (isFig) firstFigure = false;
                    return node;
                  })}
                </section>
              );
            })}
            {tp.reflection.length > 0 && (
              <section id="reflection" className="flex scroll-mt-24 flex-col gap-7" aria-labelledby="reflection-h">
                <div className="flex flex-col gap-3">
                  <Eyebrow>Reflection</Eyebrow>
                  <h2 id="reflection-h" className={H2}>What I took from it</h2>
                </div>
                {tp.reflection.map((p, i) => <p key={i} className="m-0 max-w-[68ch] text-[17px] leading-[1.65] text-sq-ink-muted sm:text-[18px]">{p}</p>)}
              </section>
            )}
            <section id="links" className="flex scroll-mt-24 flex-col gap-5 border-t border-sq-rule pt-10" aria-labelledby="links-h">
              <h2 id="links-h" className={`${MONO} m-0 text-sq-label`}>Links</h2>
              <div className="flex flex-wrap gap-3">
                {tp.links.map((l) =>
                  l.href.startsWith("/marshal/docs/") ? (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={ACTION}>{l.label} · {size}</a>
                  ) : (
                    <Link key={l.href} href={l.href} className={TEXT_LINK}>{l.label}</Link>
                  ),
                )}
              </div>
            </section>
          </div>
        </article>
      </main>
      <MarshalFooter />
    </div>
  );
}
