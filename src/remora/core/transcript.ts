/**
 * The TRANSCRIPT slot: whisper.cpp as a slot, not as infrastructure. Pure.
 *
 * This file knows three things: how to ask yt-dlp for the 16 kHz mono WAV whisper wants,
 * how to ask whisper-cli for JSON, and how to turn whisper's segments into the document
 * that drops: Markdown with a provenance header and [mm:ss] markers, so a line can be
 * cited by time. The model and its size go on the receipt, because a transcript is a
 * measurement.
 */
import type { VideoMeta } from "./meta.ts";
import type { Clip } from "./clip.ts";
import { prettyTime } from "./clip.ts";

/** yt-dlp post-processing for whisper's input: WAV, 16 kHz, one channel. */
export function wavPostprocessArgs(): string[] {
  return ["--extract-audio", "--audio-format", "wav", "--postprocessor-args", "ExtractAudio:-ar 16000 -ac 1"];
}

export type WhisperOptions = {
  model: string;
  wav: string;
  /** Output path without extension; whisper writes <outBase>.json. */
  outBase: string;
  /** "auto" lets whisper detect; the receipt records what it found. */
  language?: string;
  threads?: number;
};

export function whisperArgs(o: WhisperOptions): string[] {
  return [
    "-m", o.model,
    "-f", o.wav,
    "-l", o.language ?? "auto",
    "-t", String(o.threads ?? 4),
    "-oj",
    "-of", o.outBase,
    "-np",
  ];
}

export type Segment = {
  /** Seconds. */
  from: number;
  to: number;
  text: string;
};

export type WhisperResult = {
  language: string | null;
  segments: Segment[];
};

/** Narrow whisper-cli's -oj output. Null when it is not whisper's shape. */
export function parseWhisperJson(json: unknown): WhisperResult | null {
  if (typeof json !== "object" || json === null) return null;
  const o = json as { transcription?: unknown; result?: { language?: unknown } };
  if (!Array.isArray(o.transcription)) return null;
  const segments: Segment[] = [];
  for (const raw of o.transcription) {
    if (typeof raw !== "object" || raw === null) continue;
    const s = raw as { offsets?: { from?: unknown; to?: unknown }; text?: unknown };
    const from = s.offsets?.from;
    const to = s.offsets?.to;
    if (typeof from !== "number" || typeof to !== "number" || typeof s.text !== "string") continue;
    const text = s.text.trim();
    if (text.length === 0) continue;
    segments.push({ from: from / 1000, to: to / 1000, text });
  }
  const language = typeof o.result?.language === "string" ? o.result.language : null;
  return { language, segments };
}

/** A silence longer than this starts a new paragraph. */
export const PAUSE_SECONDS = 8;

export type TranscriptInput = {
  meta: VideoMeta;
  canonicalUrl: string;
  clip: Clip | null;
  result: WhisperResult;
  model: string;
  whisperVersion: string | null;
  now: Date;
  /** Seconds of speech per paragraph block. */
  blockSeconds?: number;
};

/**
 * The document. A header anyone can read, then paragraphs: segments are joined until a
 * block is about `blockSeconds` long, and each block opens with its start time, offset
 * by the clip's start so the markers match the original video.
 */
export function transcriptMarkdown(i: TranscriptInput): string {
  const offset = i.clip?.start ?? 0;
  const block = i.blockSeconds ?? 45;
  const lines: string[] = [];
  lines.push(`# ${i.meta.title}`);
  lines.push("");
  lines.push(`- source: ${i.canonicalUrl}`);
  if (i.meta.uploader) lines.push(`- by: ${i.meta.uploader}`);
  if (i.meta.uploadDate) lines.push(`- uploaded: ${i.meta.uploadDate}`);
  if (i.clip) lines.push(`- clip: ${prettyTime(i.clip.start)}–${prettyTime(i.clip.end)}`);
  lines.push(`- transcribed: ${i.now.toISOString()} · whisper.cpp${i.whisperVersion ? ` ${i.whisperVersion}` : ""} · ${i.model}${i.result.language ? ` · language ${i.result.language}` : ""}`);
  lines.push(`- segments: ${i.result.segments.length}`);
  lines.push("");

  let cur: string[] = [];
  let curStart: number | null = null;
  let lastTo = 0;
  const flush = () => {
    if (curStart === null || cur.length === 0) return;
    lines.push(`**[${prettyTime(Math.floor(curStart + offset))}]** ${cur.join(" ")}`);
    lines.push("");
    cur = [];
    curStart = null;
  };
  for (const s of i.result.segments) {
    // A pause longer than a breath is a paragraph break; so is a block that has run long.
    if (curStart !== null && s.from - lastTo > PAUSE_SECONDS) flush();
    if (curStart === null) curStart = s.from;
    cur.push(s.text);
    lastTo = s.to;
    if (s.to - curStart >= block) flush();
  }
  flush();
  if (i.result.segments.length === 0) {
    lines.push("_whisper heard nothing it could write down._");
    lines.push("");
  }
  return lines.join("\n");
}

/** "x [id].wav" → "x [id].transcript.md" */
export function transcriptFileName(audioFileName: string): string {
  const dot = audioFileName.lastIndexOf(".");
  const stem = dot > 0 ? audioFileName.slice(0, dot) : audioFileName;
  return `${stem}.transcript.md`;
}
