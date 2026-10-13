/**
 * The GIF slot: a clip rendered to an animated GIF. Pure.
 *
 * A GIF is a clip first: start and end are required and short, because a GIF is big per
 * second (a 5 s, 480 px GIF is ~3.7 MB). yt-dlp recodes through ffmpeg with a two-pass
 * palette (palettegen → paletteuse, Bayer dither), which is the difference between a
 * GIF and a smear. The filter graph is one argument; no shell anywhere.
 */
import type { Clip } from "./clip.ts";

export const MAX_GIF_SECONDS = 15;
export const GIF_FPS = 15;
export const GIF_WIDTH = 480;

/** yt-dlp -f for a GIF source: video only, modest height; audio would be thrown away. */
export const GIF_FORMAT_SELECTOR = `bestvideo*[height<=${GIF_WIDTH}]/best[height<=${GIF_WIDTH}]`;

const FILTER = [
  `fps=${GIF_FPS}`,
  `scale=${GIF_WIDTH}:-1:flags=lanczos`,
  "split[s0][s1]",
  "[s0]palettegen=stats_mode=diff[p]",
  "[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle",
].join(",");

/** yt-dlp's recode step and the ffmpeg arguments it should pass to it. */
export function gifPostprocessArgs(): string[] {
  return ["--recode-video", "gif", "--postprocessor-args", `VideoConvertor:-vf ${FILTER} -loop 0`];
}

/** A GIF's clip must exist and be short. Null when fine, else the reason in panel words. */
export function gifClipReason(clip: Clip | null | undefined): string | null {
  if (!clip) return "a GIF is a clip: give it a start and an end";
  if (clip.end - clip.start > MAX_GIF_SECONDS) return `a GIF is at most ${MAX_GIF_SECONDS} seconds`;
  return null;
}
