import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { NOW, type NowLink } from "@/content/now";
import { formatNowDate, sortNewestFirst } from "@/lib/now";
import { humanSize } from "@/lib/size";
import { WRAP, H2, Eyebrow } from "@/components/house/ui";

const LINK =
  "inline-flex min-h-11 items-center rounded-full border border-sq-rule bg-sq-ground px-4 text-sm font-semibold text-sq-ink hover:text-solomon-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solomon-blue";

/**
 * A local link is read at BUILD time (the page is static): the size shown is
 * the size of the file that ships, and a link to a missing file is not
 * rendered. External links pass through as they are.
 */
function resolve(l: NowLink): { href: string; text: string } | null {
  if (!l.href.startsWith("/")) return { href: l.href, text: l.label };
  const p = join(process.cwd(), "public", l.href);
  if (!existsSync(p)) return null;
  const ext = l.href.split(".").pop()?.toUpperCase() ?? "";
  const size = humanSize(statSync(p).size);
  return { href: l.href, text: `${l.label} · ${[ext, size].filter(Boolean).join(", ")}` };
}

export default function Now() {
  const entries = sortNewestFirst(NOW);
  return (
    <section id="now" className={`${WRAP} flex flex-col gap-6 pb-16`}>
      <Eyebrow>Now</Eyebrow>
      <h2 className={H2}>What we’re working on.</h2>
      <ol className="m-0 flex list-none flex-col gap-4 p-0">
        {entries.map((e) => {
          const links = (e.links ?? []).map(resolve).filter((x): x is { href: string; text: string } => x !== null);
          return (
            <li key={`${e.date}-${e.title}`}>
              <article className="flex flex-col gap-3 rounded-[20px] border border-sq-rule bg-sq-card p-6">
                <time dateTime={e.date} className="font-mono text-[12px] uppercase tracking-[0.2em] text-solomon-blue">
                  {formatNowDate(e.date)}
                </time>
                <h3 className="m-0 text-xl font-extrabold leading-snug">{e.title}</h3>
                <p className="m-0 max-w-[760px] leading-[1.55] text-sq-ink-muted">{e.body}</p>
                {links.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-1">
                    {links.map((l) => (
                      <a key={l.href} href={l.href} className={LINK}>
                        {l.text}
                      </a>
                    ))}
                  </div>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
