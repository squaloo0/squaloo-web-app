"use client";

/**
 * One numbered entry in the sketch's layout: the number and title on a rule;
 * a large media frame on the left; on the right a "View" button, a GitHub
 * link with the logo, and a short overview. Entries are data; this one
 * component renders every one of them.
 *
 * Client component because "View" on a video entry pages the frame to the
 * video and plays it. The media records are resolved on the server (Timeline)
 * and passed in, so the media table itself stays out of the client bundle.
 */
import { useState } from "react";
import Link from "next/link";
import MediaFrame from "./MediaFrame";
import { MONO, TEXT_LINK } from "./styles";
import type { MediaRecord } from "../_data/media";
import type { WorkEntry as Entry } from "../_data/work";
import { ACTION } from "@/components/house/ui";

type View = { kind: "page" | "video" | "link"; href?: string; label: string };

const GH_BUTTON =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-sq-rule text-sq-ink hover:border-solomon-blue hover:text-solomon-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solomon-blue";

/** Outbound links and PDFs open in a new tab; in-site pages do not. */
function newTab(href: string) {
  return href.startsWith("http") || href.endsWith(".pdf") ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

function GitHubLogo() {
  return (
    <svg viewBox="0 0 16 16" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

type Props = {
  entry: Entry;
  /** The entry's media, resolved, with its linked video appended when it has one. */
  items: readonly MediaRecord[];
  priority?: boolean;
};

export default function WorkEntry({ entry, items, priority = false }: Props) {
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const { links } = entry;
  const videoIndex = links.video ? items.findIndex((m) => m.kind === "video" && m.id.endsWith(links.video!)) : -1;

  // What "View" does, in order: the entry's own page, its video, its live site, its deck.
  let view: View | null = null;
  if (entry.page) view = { kind: "page", href: `/marshal/${entry.slug}`, label: `View ${entry.title}` };
  else if (videoIndex >= 0) view = { kind: "video", label: `Play the ${entry.title} video` };
  else if (links.live) view = { kind: "link", href: links.live, label: `Open ${entry.title}` };
  else if (links.deck) view = { kind: "link", href: links.deck, label: `Open the ${entry.title} deck (PDF)` };

  const extra: { label: string; href: string }[] = [];
  if (links.live && view?.href !== links.live) extra.push({ label: "Live site", href: links.live });
  if (links.deck && view?.href !== links.deck) extra.push({ label: "Deck (PDF)", href: links.deck });

  const play = () => {
    setIndex(videoIndex);
    setAutoPlay(true);
  };

  return (
    <article id={entry.slug} className="flex scroll-mt-24 flex-col gap-4" aria-labelledby={`${entry.slug}-title`}>
      <div className="flex items-baseline gap-4 border-b border-sq-rule pb-3">
        <span className="font-mono text-[13px] tracking-[0.12em] text-sq-ink">#{entry.number}</span>
        <h3 id={`${entry.slug}-title`} className="m-0 font-display text-[26px] font-medium leading-[1.1] sm:text-[30px]">
          {entry.title}
        </h3>
      </div>
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] md:gap-8">
        <MediaFrame items={items} label={entry.title} index={index} onIndex={setIndex} priority={priority} autoPlay={autoPlay} />
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {view?.kind === "page" && (
              <Link href={view.href!} className={ACTION} aria-label={view.label}>
                View
              </Link>
            )}
            {view?.kind === "video" && (
              <button type="button" className={ACTION} aria-label={view.label} onClick={play}>
                View
              </button>
            )}
            {view?.kind === "link" && (
              <a href={view.href} {...newTab(view.href!)} className={ACTION} aria-label={view.label}>
                View
              </a>
            )}
            {links.github && (
              <a
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${entry.title} on GitHub`}
                className={GH_BUTTON}
              >
                <GitHubLogo />
              </a>
            )}
          </div>
          <p className="m-0 text-[16px] leading-[1.6] text-sq-ink-muted">{entry.overview}</p>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px] leading-[1.5]">
            <dt className={`${MONO} text-sq-label`}>Context</dt>
            <dd className="m-0 text-sq-ink-muted">{entry.context}</dd>
            <dt className={`${MONO} text-sq-label`}>Role</dt>
            <dd className="m-0 text-sq-ink-muted">{entry.role}</dd>
            {entry.team && (
              <>
                <dt className={`${MONO} text-sq-label`}>Team</dt>
                <dd className="m-0 text-sq-ink-muted">{entry.team.join(", ")}</dd>
              </>
            )}
          </dl>
          {extra.length > 0 && (
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[14px]">
              {extra.map((l) => (
                <a key={l.label} href={l.href} {...newTab(l.href)} className={TEXT_LINK}>
                  {l.label}
                  <span aria-hidden="true" className="ml-1">↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
