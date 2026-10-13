/**
 * The VIDEO slot's one dial: how good. Turns a quality request into the `-f` string
 * yt-dlp wants, and estimates what will drop. Pure.
 */
import type { VideoFormat, VideoMeta } from "./meta.ts";
import { GIF_FORMAT_SELECTOR, gifPostprocessArgs } from "./gif.ts";
import { wavPostprocessArgs } from "./transcript.ts";

/**
 * The VIDEO slot's heights, and the AUDIO slot's three containers:
 *   audio       the AUDIO slot: mp3, best VBR, plays on anything
 *   m4a         AAC in an MP4 shell: smaller, Apple-native
 *   audio-raw   the best audio track yt-dlp can find, untouched (usually opus in webm)
 */
export type Quality = "best" | "2160" | "1440" | "1080" | "720" | "480" | "360" | "audio" | "m4a" | "audio-raw" | "gif" | "thumbs" | "transcript" | "chapters";

export const QUALITIES: readonly Quality[] = ["best", "2160", "1440", "1080", "720", "480", "360", "audio", "m4a", "audio-raw", "gif", "thumbs", "transcript", "chapters"];

/** Slots that never download the video: the drop is made from metadata alone. */
export function isMetadataOnly(q: Quality): boolean {
  return q === "chapters";
}

export const AUDIO_QUALITIES: readonly Quality[] = ["audio", "m4a", "audio-raw"];

export function isAudio(q: Quality): boolean {
  return (AUDIO_QUALITIES as readonly string[]).includes(q);
}

/** "1080p", "1080", "4k", "best", "audio", "mp3", "m4a", "raw", "BEST " → a Quality; anything else null. */
export function parseQuality(input: string | undefined | null): Quality | null {
  if (input === undefined || input === null) {
    return "best";
  }
  const s = input.trim().toLowerCase();
  if (s === "" || s === "best") return "best";
  if (s === "audio" || s === "mp3") return "audio";
  if (s === "m4a" || s === "aac") return "m4a";
  if (s === "audio-raw" || s === "raw" || s === "opus") return "audio-raw";
  if (s === "gif") return "gif";
  if (s === "thumbs" || s === "contact" || s === "sheet") return "thumbs";
  if (s === "transcript" || s === "transcribe" || s === "whisper" || s === "text") return "transcript";
  if (s === "chapters" || s === "chapter" || s === "toc") return "chapters";
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
  if (q === "gif" || q === "thumbs") return GIF_FORMAT_SELECTOR;
  if (isAudio(q) || q === "transcript" || q === "chapters") return "bestaudio/best"; // chapters never fetch; the selector is moot
  return `bestvideo*[height<=${q}]+bestaudio/best[height<=${q}]/best`;
}

/** Container yt-dlp should merge into, or null when nothing is merged. */
export function mergeContainer(q: Quality): "mp4" | null {
  return isAudio(q) || q === "gif" || q === "thumbs" || q === "transcript" || q === "chapters" ? null : "mp4";
}

/**
 * yt-dlp's post-processing arguments for the AUDIO slot. ffmpeg does the work, through
 * yt-dlp; we never shell out to it. mp3 at VBR 0 (~245 kbps) because it plays on anything;
 * m4a without a quality flag because yt-dlp's AAC default is sane and the source is often
 * AAC already, which it then only remuxes. Raw gets nothing: the track as the host served it.
 */
export function postprocessArgs(q: Quality): string[] {
  switch (q) {
    case "audio":
      return ["--extract-audio", "--audio-format", "mp3", "--audio-quality", "0"];
    case "m4a":
      return ["--extract-audio", "--audio-format", "m4a"];
    case "gif":
      return gifPostprocessArgs();
    case "transcript":
      return wavPostprocessArgs();
    default:
      return [];
  }
}

/** The extension a vend of this quality lands with, when we can know it. */
export function expectedExt(q: Quality): string | null {
  return q === "audio" ? "mp3" : q === "m4a" ? "m4a" : q === "gif" ? "gif" : q === "thumbs" ? "jpg" : q === "transcript" || q === "chapters" ? "md" : isAudio(q) ? null : "mp4";
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
  if (q === "chapters") return { height: null, bytes: null, approx: false, formatIds: [] };
  const usable = meta.formats.filter((f) => f.vcodec !== null || f.acodec !== null);
  const audioOnly = usable.filter((f) => f.vcodec === null && f.acodec !== null);
  const videoOnly = usable.filter((f) => f.vcodec !== null && f.acodec === null);
  const muxed = usable.filter((f) => f.vcodec !== null && f.acodec !== null);

  if (isAudio(q) || q === "transcript") {
    // A transcode changes the size; raw keeps it. Either way the source track is the guide.
    const a = best(audioOnly) ?? best(muxed);
    return a ? { height: null, bytes: a.bytes, approx: a.bytesApprox || q !== "audio-raw", formatIds: [a.formatId] } : null;
  }

  const cap = q === "best" ? Infinity : q === "gif" || q === "thumbs" ? 480 : Number(q);
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
