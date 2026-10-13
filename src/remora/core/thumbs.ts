/**
 * The THUMBS slot: a contact sheet. Twelve frames evenly spaced across the video (or
 * across the clip, if one was given), tiled four by three into one JPEG. Pure: this file
 * builds the ffmpeg arguments; src/remora/ffmpeg.ts runs them.
 */

export const THUMBS_COLS = 4;
export const THUMBS_ROWS = 3;
export const THUMBS_FRAMES = THUMBS_COLS * THUMBS_ROWS;
/** Each frame's width; the sheet is COLS times this. */
export const THUMBS_FRAME_WIDTH = 320;

export type ThumbsPlan = {
  /** Seconds between sampled frames. */
  step: number;
  /** ffmpeg arguments, input and output included. */
  args: string[];
};

/**
 * ffmpeg samples one frame every `step` seconds from the start, scales each to the frame
 * width, and tiles them. `-frames:v 1` keeps exactly one sheet. A source shorter than a
 * second is refused rather than tiled into nothing.
 */
export function thumbsPlan(input: string, output: string, durationSeconds: number): ThumbsPlan | null {
  if (!Number.isFinite(durationSeconds) || durationSeconds < 1) return null;
  const step = durationSeconds / THUMBS_FRAMES;
  const vf = `fps=1/${step.toFixed(4)},scale=${THUMBS_FRAME_WIDTH}:-2,tile=${THUMBS_COLS}x${THUMBS_ROWS}`;
  return {
    step,
    args: ["-y", "-hide_banner", "-loglevel", "error", "-i", input, "-vf", vf, "-frames:v", "1", "-q:v", "3", output],
  };
}

/** "x [id] clip 83-105.mp4" → "x [id] clip 83-105.thumbs.jpg"; "x.webm" → "x.thumbs.jpg". */
export function thumbsFileName(videoFileName: string): string {
  const dot = videoFileName.lastIndexOf(".");
  const stem = dot > 0 ? videoFileName.slice(0, dot) : videoFileName;
  return `${stem}.thumbs.jpg`;
}
