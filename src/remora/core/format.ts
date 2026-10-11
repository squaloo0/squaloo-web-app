/**
 * The VIDEO slot's one dial: how good. Turns a quality request into the `-f` string
 * yt-dlp wants, and estimates what will drop. Pure.
 */
import type { VideoFormat, VideoMeta } from "./meta.ts";

export type Quality = "best" | "2160" | "1440" | "1080" | "720" | "480" | "360" | "audio";

export const QUALITIES: readonly Quality[] = ["best", "2160", "1440", "1080", "720", "480", "360", "audio"];

/** "1080p", "1080", "4k", "best", "audio", "BEST " → a Quality; anything else null. */
export function parseQuality(input: string | undefined | null): Quality | null {
  if (input === undefined || input === null) {
    return "best";
  }
  const s = input.trim().toLowerCase();
  if (s === "" || s === "best") return "best";
  if (s === "audio" || s === "mp3" || s === "m4a") return "audio";
  if (s === "4k" || s === "uhd") return "2160";
  if (s === "2k") return "1440";
  const m = /^(\d{3,4})p?$/.exec(s);
  if (m && (QUALITIES as readonly string[]).includes(m[1])) {
    return m[1] as Quality;
  }
  return null;
}

/**
 * yt-dlp's -f expression. Video qualities ask for the best video track at or under the
 * height plus the best audio, merged; falling back to a muxed file when there is nothing
 * to merge. Audio is just the best audio track, untouched (the AUDIO slot transcodes).
 */
export function formatSelector(q: Quality): string {
  if (q === "best") return "bestvideo*+bestaudio/best";
  if (q === "audio") return "bestaudio/best";
  return `bestvideo*[height<=${q}]+bestaudio/best[height<=${q}]/best`;
}

/** Container yt-dlp should merge into, or null when nothing is merged. */
export function mergeContainer(q: Quality): "mp4" | null {
  return q === "audio" ? null : "mp4";
}

export type Estimate = {
  /** The video track we expect, or null for audio. */
  height: number | null;
  /** Expected bytes on disk (video + audio), or null when yt-dlp gave no sizes. */
  bytes: number | null;
  /** True when any part of `bytes` was yt-dlp's estimate. */
  approx: boolean;
  formatIds: string[];
};

/**
 * What the selector will probably pick, from the formats we already have. Mirrors
 * yt-dlp's preference loosely (highest height, then most bytes) so the number on the
 * panel is in the right neighbourhood, not a promise. Null when nothing fits.
 */
export function estimate(meta: VideoMeta, q: Quality): Estimate | null {
  const usable = meta.formats.filter((f) => f.vcodec !== null || f.acodec !== null);
  const audioOnly = usable.filter((f) => f.vcodec === null && f.acodec !== null);
  const videoOnly = usable.filter((f) => f.vcodec !== null && f.acodec === null);
  const muxed = usable.filter((f) => f.vcodec !== null && f.acodec !== null);

  if (q === "audio") {
    const a = best(audioOnly) ?? best(muxed);
    return a ? { height: null, bytes: a.bytes, approx: a.bytesApprox, formatIds: [a.formatId] } : null;
  }

  const cap = q === "best" ? Infinity : Number(q);
  const v = best(videoOnly.filter((f) => (f.height ?? 0) <= cap));
  const a = best(audioOnly);
  if (v && a) {
    return {
      height: v.height,
      bytes: v.bytes === null || a.bytes === null ? null : v.bytes + a.bytes,
      approx: v.bytesApprox || a.bytesApprox,
      formatIds: [v.formatId, a.formatId],
    };
  }
  const m = best(muxed.filter((f) => (f.height ?? 0) <= cap)) ?? best(muxed);
  return m ? { height: m.height, bytes: m.bytes, approx: m.bytesApprox, formatIds: [m.formatId] } : null;
}

/** Highest height, then most bytes, then whatever yt-dlp listed last (its own "best"). */
function best(formats: VideoFormat[]): VideoFormat | null {
  let pick: VideoFormat | null = null;
  for (const f of formats) {
    if (
      pick === null ||
      (f.height ?? 0) > (pick.height ?? 0) ||
      ((f.height ?? 0) === (pick.height ?? 0) && (f.bytes ?? 0) >= (pick.bytes ?? 0))
    ) {
      pick = f;
    }
  }
  return pick;
}
