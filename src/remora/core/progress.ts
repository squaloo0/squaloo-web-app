/**
 * The needle on the front of the machine. yt-dlp is told to print one line per tick in
 * a shape we chose; this file reads those lines. Pure.
 */

/** Passed to yt-dlp as --progress-template. Fields are "NA" when yt-dlp has no value. */
export const PROGRESS_TEMPLATE =
  "download:remora|%(progress.status)s|%(progress.downloaded_bytes)s|%(progress.total_bytes)s|%(progress.total_bytes_estimate)s|%(progress.speed)s|%(progress.eta)s|%(progress.filename)s";

export const POSTPROCESS_TEMPLATE = "postprocess:remora-pp|%(progress.status)s|%(progress.postprocessor)s";

export type Progress = {
  kind: "download";
  status: "downloading" | "finished";
  downloaded: number;
  /** Bytes expected for this file, exact or estimated; null when yt-dlp has no idea. */
  total: number | null;
  approx: boolean;
  /** Bytes per second, when known. */
  speed: number | null;
  /** Seconds, when known. */
  eta: number | null;
  filename: string;
};

export type PostProcess = {
  kind: "postprocess";
  status: "started" | "finished";
  /** "Merger", "FFmpegFixupM4a", ... */
  processor: string;
};

/** One line of yt-dlp output → a tick, or null when the line is not ours. */
export function parseProgressLine(line: string): Progress | PostProcess | null {
  const s = line.trim();
  if (s.startsWith("remora|")) {
    const [, status, downloaded, total, estimate, speed, eta, ...rest] = s.split("|");
    if (status !== "downloading" && status !== "finished") {
      return null;
    }
    const exact = num(total);
    const est = num(estimate);
    return {
      kind: "download",
      status,
      downloaded: num(downloaded) ?? 0,
      total: exact ?? est,
      approx: exact === null && est !== null,
      speed: num(speed),
      eta: num(eta),
      filename: rest.join("|"),
    };
  }
  if (s.startsWith("remora-pp|")) {
    const [, status, processor] = s.split("|");
    if (status !== "started" && status !== "finished") {
      return null;
    }
    return { kind: "postprocess", status, processor: processor ?? "" };
  }
  return null;
}

/** 0..1, or null when the total is unknown. */
export function fraction(p: Progress): number | null {
  if (p.status === "finished") return 1;
  if (p.total === null || p.total <= 0) return null;
  return Math.min(1, p.downloaded / p.total);
}

function num(s: string | undefined): number | null {
  if (s === undefined || s === "NA" || s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
