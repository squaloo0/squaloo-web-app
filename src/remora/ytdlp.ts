/**
 * The I/O edge around yt-dlp. Everything that touches a process lives here; the
 * parsing lives in core/meta.ts and is pure.
 *
 * Always `spawn(bin, [args])`. A URL is an argument, never part of a shell string, so a
 * customer who pastes `; rm -rf /` gets a polite "not a video" and nothing else.
 */
import { spawn } from "node:child_process";
import { parseYtDlpJson, MetaError, type VideoMeta } from "./core/meta.ts";

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

/** `yt-dlp --version`, trimmed. "2026.08.19" and the like. */
export async function ytDlpVersion(opts: YtDlpOptions = {}): Promise<string> {
  const { stdout } = await run(["--version"], { timeoutMs: 10_000, ...opts });
  return stdout.trim();
}

export type YtDlpRun = { stdout: string; stderr: string };

/**
 * Run yt-dlp with exactly these arguments and collect its output. The building block
 * under ytDlpInfo/ytDlpVersion; Phase 2 streams progress through a sibling of this.
 */
export function run(args: string[], opts: YtDlpOptions = {}): Promise<YtDlpRun> {
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

    child.stdout.on("data", (b: Buffer) => out.push(b));
    child.stderr.on("data", (b: Buffer) => {
      err = (err + b.toString("utf8")).slice(-STDERR_KEEP);
    });
    child.on("error", (e: NodeJS.ErrnoException) => {
      const kind: YtDlpErrorKind = e.code === "ENOENT" ? "not-found" : "exit";
      const message = e.code === "ENOENT" ? `${bin} not found on PATH` : `${bin}: ${e.message}`;
      settle(() => reject(new YtDlpError(kind, message, null, err)));
    });
    child.on("close", (code, signal) => {
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
