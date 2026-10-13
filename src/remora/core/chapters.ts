/**
 * The CHAPTERS slot: the video's chapter list as a document. Pure.
 *
 * yt-dlp already hands us chapters, the uploader's or ones it read off timestamps in the
 * description. The drop is Markdown: a provenance header, then one line per chapter with
 * its start, length, title, and a link that opens the video at that second. No download
 * of the video itself: this slot is the cheapest coin in the machine.
 */
import type { Chapter, VideoMeta } from "./meta.ts";
import { prettyTime } from "./clip.ts";

export type ChaptersInput = {
  meta: VideoMeta;
  canonicalUrl: string;
  provider: string;
  now: Date;
};

/** A link that opens the video at a second, where the provider supports it. */
export function linkAt(canonicalUrl: string, provider: string, seconds: number): string | null {
  const s = Math.floor(seconds);
  if (provider === "youtube") {
    const u = new URL(canonicalUrl);
    u.searchParams.set("t", `${s}s`);
    return u.toString();
  }
  if (provider === "vimeo") return `${canonicalUrl}#t=${s}s`;
  return null;
}

export function chaptersMarkdown(i: ChaptersInput): string {
  const lines: string[] = [];
  lines.push(`# ${i.meta.title}`);
  lines.push("");
  lines.push(`- source: ${i.canonicalUrl}`);
  if (i.meta.uploader) lines.push(`- by: ${i.meta.uploader}`);
  if (i.meta.uploadDate) lines.push(`- uploaded: ${i.meta.uploadDate}`);
  if (i.meta.duration !== null) lines.push(`- length: ${prettyTime(Math.round(i.meta.duration))}`);
  lines.push(`- chapters: ${i.meta.chapters.length} · read ${i.now.toISOString()}`);
  lines.push("");
  lines.push("| # | start | length | chapter |");
  lines.push("|--:|------:|-------:|---------|");
  i.meta.chapters.forEach((c, n) => {
    const link = linkAt(i.canonicalUrl, i.provider, c.start);
    const start = link ? `[${prettyTime(Math.floor(c.start))}](${link})` : prettyTime(Math.floor(c.start));
    lines.push(`| ${n + 1} | ${start} | ${prettyTime(Math.round(c.end - c.start))} | ${escapeCell(c.title)} |`);
  });
  lines.push("");
  return lines.join("\n");
}

function escapeCell(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

/** A chapter list is a measurement too: this is what goes on the receipt. */
export function chaptersSummary(chapters: readonly Chapter[]): { count: number; first: string | null; last: string | null } {
  return { count: chapters.length, first: chapters[0]?.title ?? null, last: chapters.at(-1)?.title ?? null };
}

/** "x [id].chapters.md" from the yt-dlp-style stem the other slots use. */
export function chaptersFileName(title: string, id: string): string {
  const stem = title.replace(/[/\\:*?"<>|]/g, "_").slice(0, 120);
  return `${stem} [${id}].chapters.md`;
}
