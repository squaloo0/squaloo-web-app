/**
 * The I/O edge around yt-dlp. Everything that touches a process lives here; the
 * parsing lives in core/meta.ts and is pure.
 *
 * Always `spawn(bin, [args])`. A URL is an argument, never part of a shell string, so a
 * customer who pastes `; rm -rf /` gets a polite "not a video" and nothing else.
 */
import { spawn } from "node:child_process";
import { parseYtDlpJson, MetaError, type VideoMeta } from "./core/meta.ts";
import { formatSelector, mergeContainer, type Quality } from "./core/format.ts";
import { parseProgressLine, POSTPROCESS_TEMPLATE, PROGRESS_TEMPLATE, type PostProcess, type Progress } from "./core/progress.ts";

export type YtDlpErrorKind =
  /** The binary is not on PATH (or REMORA_YTDLP_BIN points nowhere). */
  | "not-found"
  /** We killed it after `timeoutMs`. */
  | "timeout"
  /** It ran and exited non-zero; `stderr` has the last few lines. */
  | "exit"
  /** It exited zero but printed something core/meta could not narrow. */
  | "bad-json";

export class YtDlpError extends Error {
  readonly kind: YtDlpErrorKind;
  readonly exitCode: number | null;
  readonly stderr: string;
  constructor(kind: YtDlpErrorKind, message: string, exitCode: number | null = null, stderr = "") {
    super(message);
    this.name = "YtDlpError";
    this.kind = kind;
    this.exitCode = exitCode;
    this.stderr = stderr;
  }
}

export type YtDlpOptions = {
  /** Defaults to REMORA_YTDLP_BIN, then "yt-dlp" on PATH. */
  bin?: string;
  /** Wall clock budget for the whole call. Default 60 s. */
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 60_000;
const STDERR_KEEP = 2_000;

export function ytDlpBin(): string {
  return process.env.REMORA_YTDLP_BIN || "yt-dlp";
}

/** `yt-dlp --dump-single-json --no-playlist <url>`, narrowed to a VideoMeta. */
export async function ytDlpInfo(url: string, opts: YtDlpOptions = {}): Promise<VideoMeta> {
  const { stdout } = await run(["--dump-single-json", "--no-playlist", "--no-warnings", "--", url], opts);
  try {
    return parseYtDlpJson(stdout);
  } catch (e) {
    if (e instanceof MetaError) {
      throw new YtDlpError("bad-json", `yt-dlp output did not narrow: ${e.message}`);
    }
    throw e;
  }
}

export type DownloadOptions = YtDlpOptions & {
  /** Directory the file lands in. Created by yt-dlp if missing. */
  dir: string;
  quality: Quality;
  /** Called on every tick. Download ticks come from stdout, postprocessor ticks from stderr. */
  onTick?: (tick: Progress | PostProcess) => void;
};

export type Download = {
  /** Absolute path of the final file, after merge and move. */
  filepath: string;
  stderr: string;
};

const DOWNLOAD_TIMEOUT_MS = 30 * 60_000;
/** Readable names, capped so a 300-character title does not hit the filesystem limit. */
const OUTPUT_TEMPLATE = "%(title).120B [%(id)s].%(ext)s";

/**
 * The VIDEO slot. Streams yt-dlp's progress through `onTick`, resolves with the final
 * file path yt-dlp prints after its own move step. ffmpeg is invoked by yt-dlp for the
 * merge; we never shell out to it ourselves.
 */
export function ytDlpDownload(url: string, opts: DownloadOptions): Promise<Download> {
  const args = ["--no-playlist", "--no-warnings", "--newline", "--progress", "-f", formatSelector(opts.quality)];
  const container = mergeContainer(opts.quality);
  if (container) {
    args.push("--merge-output-format", container);
  }
  args.push(
    "-P", opts.dir,
    "-o", OUTPUT_TEMPLATE,
    "--progress-template", PROGRESS_TEMPLATE,
    "--progress-template", POSTPROCESS_TEMPLATE,
    "--print", "after_move:filepath",
    "--", url,
  );

  let filepath: string | null = null;
  const onStdoutLine = (line: string) => {
    const tick = parseProgressLine(line);
    if (tick) {
      opts.onTick?.(tick);
    } else if (line.trim().length > 0 && !line.startsWith("[")) {
      // --print output: the last plain line on stdout is the moved file's path.
      filepath = line.trim();
    }
  };
  const onStderrLine = (line: string) => {
    // Postprocessor ticks arrive here; anything else is noise or an error, kept in the tail.
    const tick = parseProgressLine(line);
    if (tick) opts.onTick?.(tick);
  };

  return run(args, { bin: opts.bin, timeoutMs: opts.timeoutMs ?? DOWNLOAD_TIMEOUT_MS, onStdoutLine, onStderrLine }).then(({ stderr }) => {
    if (filepath === null) {
      throw new YtDlpError("bad-json", "yt-dlp finished without printing the file path", 0, stderr);
    }
    return { filepath, stderr };
  });
}

/** `yt-dlp --version`, trimmed. "2026.08.19" and the like. */
export async function ytDlpVersion(opts: YtDlpOptions = {}): Promise<string> {
  const { stdout } = await run(["--version"], { timeoutMs: 10_000, ...opts });
  return stdout.trim();
}

export type YtDlpRun = { stdout: string; stderr: string };

type RunOptions = YtDlpOptions & {
  /** When given, stdout is handed over line by line instead of collected. */
  onStdoutLine?: (line: string) => void;
  /** When given, stderr lines are handed over as well as kept in the tail. */
  onStderrLine?: (line: string) => void;
};

/**
 * Run yt-dlp with exactly these arguments and collect its output. The building block
 * under ytDlpInfo, ytDlpVersion and ytDlpDownload.
 */
export function run(args: string[], opts: RunOptions = {}): Promise<YtDlpRun> {
  const bin = opts.bin ?? ytDlpBin();
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return new Promise<YtDlpRun>((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    const out: Buffer[] = [];
    let err = "";
    let settled = false;
    const settle = (fn: () => void) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        fn();
      }
    };

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      settle(() => reject(new YtDlpError("timeout", `yt-dlp took longer than ${timeoutMs} ms`, null, err)));
    }, timeoutMs);

    const outLines = lineSplitter(opts.onStdoutLine);
    const errLines = lineSplitter(opts.onStderrLine);
    child.stdout.on("data", (b: Buffer) => {
      if (opts.onStdoutLine) outLines(b);
      else out.push(b);
    });
    child.stderr.on("data", (b: Buffer) => {
      err = (err + b.toString("utf8")).slice(-STDERR_KEEP);
      errLines(b);
    });
    child.on("error", (e: NodeJS.ErrnoException) => {
      const kind: YtDlpErrorKind = e.code === "ENOENT" ? "not-found" : "exit";
      const message = e.code === "ENOENT" ? `${bin} not found on PATH` : `${bin}: ${e.message}`;
      settle(() => reject(new YtDlpError(kind, message, null, err)));
    });
    child.on("close", (code, signal) => {
      outLines(null);
      errLines(null);
      settle(() => {
        if (code === 0) {
          resolve({ stdout: Buffer.concat(out).toString("utf8"), stderr: err });
        } else {
          const why = signal ? `killed by ${signal}` : `exited ${code}`;
          const lastLine = err.trim().split("\n").at(-1) ?? "";
          reject(new YtDlpError("exit", `yt-dlp ${why}${lastLine ? `: ${lastLine}` : ""}`, code, err));
        }
      });
    });
  });
}

/** Buffers chunks and emits whole lines; pass null to flush the last partial line. */
function lineSplitter(onLine: ((line: string) => void) | undefined): (chunk: Buffer | null) => void {
  let rest = "";
  return (chunk) => {
    if (!onLine) return;
    if (chunk === null) {
      if (rest.length > 0) onLine(rest);
      rest = "";
      return;
    }
    rest += chunk.toString("utf8");
    let i: number;
    while ((i = rest.indexOf("\n")) >= 0) {
      onLine(rest.slice(0, i).replace(/\r$/, ""));
      rest = rest.slice(i + 1);
    }
  };
}
