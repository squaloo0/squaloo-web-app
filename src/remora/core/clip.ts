/**
 * The CLIP slot: a start and an end on top of the quality dial. Pure.
 *
 * Times are typed the way people type them: "83", "1:23", "1:02:03", "1:23.5". A range
 * is "start-end". yt-dlp cuts the section and, with forced keyframes, re-encodes just
 * enough that the file begins where the customer said, not at the previous keyframe.
 */

export type Clip = {
  /** Seconds from the start of the video. */
  start: number;
  /** Seconds. Must be greater than start. */
  end: number;
};

export const MIN_CLIP_SECONDS = 1;
/** Ten minutes: a clip is a clip. Longer is the VIDEO slot. */
export const MAX_CLIP_SECONDS = 600;

/** "1:23" → 83, "1:02:03" → 3723, "83.5" → 83.5, "" → null, "abc" → null. */
export function parseTime(input: string | undefined | null): number | null {
  if (input === undefined || input === null) return null;
  const s = input.trim();
  if (s === "") return null;
  if (/^\d+(?:\.\d{1,3})?$/.test(s)) return Number(s); // plain seconds, any size
  const m = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{1,2}(?:\.\d{1,3})?)$/.exec(s);
  if (!m) return null;
  const parts = [m[1], m[2], m[3]].filter((p): p is string => p !== undefined).map(Number);
  // one part: seconds; two: m:ss; three: h:mm:ss
  let seconds = 0;
  for (const p of parts) seconds = seconds * 60 + p;
  return seconds;
}

export type ClipParse = { ok: true; clip: Clip } | { ok: false; reason: string };

/** Two typed times → a Clip, or a reason in panel language. */
export function parseClip(start: string | undefined | null, end: string | undefined | null): ClipParse | null {
  const s = (start ?? "").trim();
  const e = (end ?? "").trim();
  if (s === "" && e === "") return null; // no clip asked for
  const a = parseTime(s);
  const b = parseTime(e);
  if (a === null) return { ok: false, reason: "start time: try 1:23 or 83" };
  if (b === null) return { ok: false, reason: "end time: try 1:45 or 105" };
  if (b <= a) return { ok: false, reason: "the end must come after the start" };
  if (b - a < MIN_CLIP_SECONDS) return { ok: false, reason: `a clip is at least ${MIN_CLIP_SECONDS} second` };
  if (b - a > MAX_CLIP_SECONDS) return { ok: false, reason: `a clip is at most ${MAX_CLIP_SECONDS / 60} minutes; longer is the VIDEO slot` };
  return { ok: true, clip: { start: a, end: b } };
}

/** "1:23-1:45" → the same as parseClip("1:23", "1:45"). */
export function parseClipSpec(spec: string | undefined | null): ClipParse | null {
  if (!spec || spec.trim() === "") return null;
  const i = spec.indexOf("-");
  if (i < 0) return { ok: false, reason: "a clip is start-end, like 1:23-1:45" };
  return parseClip(spec.slice(0, i), spec.slice(i + 1));
}

/** yt-dlp's arguments for one section, cut cleanly. */
export function clipArgs(clip: Clip): string[] {
  return ["--download-sections", `*${fmt(clip.start)}-${fmt(clip.end)}`, "--force-keyframes-at-cuts"];
}

function fmt(seconds: number): string {
  return Number.isInteger(seconds) ? String(seconds) : seconds.toFixed(3).replace(/0+$/, "");
}

/** 83 → "1:23", 3723.5 → "1:02:03.5". */
export function prettyTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const sec = Number.isInteger(s) ? String(s).padStart(2, "0") : s.toFixed(1).padStart(4, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

/** "1:23–1:45 (22s)" */
export function prettyClip(clip: Clip): string {
  return `${prettyTime(clip.start)}–${prettyTime(clip.end)} (${prettyDurationShort(clip.end - clip.start)})`;
}

function prettyDurationShort(seconds: number): string {
  return seconds < 60 ? `${Number.isInteger(seconds) ? seconds : seconds.toFixed(1)}s` : prettyTime(seconds);
}

/** A file name tag yt-dlp cannot get wrong: whole seconds. */
export function clipTag(clip: Clip): string {
  return `clip ${Math.floor(clip.start)}-${Math.ceil(clip.end)}`;
}
