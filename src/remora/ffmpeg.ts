/**
 * The I/O edge around ffmpeg, for the one thing yt-dlp does not do for us: tiling a
 * contact sheet. spawn(bin, [args]) through the same runner as yt-dlp; never a shell.
 * REMORA_FFMPEG_BIN overrides the binary, as it does for the version probe in vend.ts.
 */
import { run, YtDlpError } from "./ytdlp.ts";

export class FfmpegError extends Error {
  readonly kind: "not-found" | "timeout" | "exit";
  readonly stderr: string;
  constructor(kind: "not-found" | "timeout" | "exit", message: string, stderr = "") {
    super(message);
    this.name = "FfmpegError";
    this.kind = kind;
    this.stderr = stderr;
  }
}

export function ffmpegBin(): string {
  return process.env.REMORA_FFMPEG_BIN || "ffmpeg";
}

/** Run ffmpeg with exactly these arguments. Five-minute budget: a contact sheet is seconds. */
export async function ffmpeg(args: string[], timeoutMs = 5 * 60_000): Promise<void> {
  try {
    await run(args, { bin: ffmpegBin(), timeoutMs });
  } catch (e) {
    if (e instanceof YtDlpError) {
      const kind = e.kind === "not-found" ? "not-found" : e.kind === "timeout" ? "timeout" : "exit";
      const message = e.kind === "not-found" ? `${ffmpegBin()} not found on PATH` : e.message.replace(/^yt-dlp/, "ffmpeg");
      throw new FfmpegError(kind, message, e.stderr);
    }
    throw e;
  }
}
