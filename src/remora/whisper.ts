/**
 * The I/O edge around whisper.cpp. A machine that has the binary and a model can vend
 * transcripts; one that does not says so and leaves those coins for one that can.
 *
 * Env:
 *   REMORA_WHISPER_BIN     default "whisper-cli" (brew install whisper-cpp on a Mac)
 *   REMORA_WHISPER_MODEL   default ~/.remora/models/ggml-base.bin
 *   REMORA_WHISPER_THREADS default 4
 *   REMORA_WHISPER_LANGUAGE default "auto"; whisper guesses from the first 30 s, which a
 *                          short sung clip can fool. A machine that mostly vends one
 *                          language can pin it ("en").
 */
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { run, YtDlpError } from "./ytdlp.ts";
import { parseWhisperJson, whisperArgs, type WhisperResult } from "./core/transcript.ts";

export class WhisperError extends Error {
  readonly kind: "not-found" | "no-model" | "timeout" | "exit" | "bad-json";
  constructor(kind: WhisperError["kind"], message: string) {
    super(message);
    this.name = "WhisperError";
    this.kind = kind;
  }
}

export function whisperBin(): string {
  return process.env.REMORA_WHISPER_BIN || "whisper-cli";
}

export function whisperModel(): string {
  return process.env.REMORA_WHISPER_MODEL || join(homedir(), ".remora", "models", "ggml-base.bin");
}

/** The model's file name, for the receipt and the document. */
export function whisperModelName(): string {
  return basename(whisperModel());
}

/** Is this machine able to transcribe? The model file must exist; the binary is probed by version. */
export async function whisperWired(): Promise<{ ok: true; version: string | null } | { ok: false; reason: string }> {
  if (!existsSync(whisperModel())) return { ok: false, reason: `no model at ${whisperModel()}` };
  try {
    const { stdout, stderr } = await run(["--version"], { bin: whisperBin(), timeoutMs: 10_000 });
    const m = /whisper\.cpp version:?\s*([\w.]+)/i.exec(stdout + stderr);
    return { ok: true, version: m ? m[1] : null };
  } catch (e) {
    if (e instanceof YtDlpError && e.kind === "not-found") return { ok: false, reason: `${whisperBin()} not on PATH` };
    // Some builds exit non-zero on --version; the binary still ran.
    if (e instanceof YtDlpError && e.kind === "exit") {
      const m = /whisper\.cpp version:?\s*([\w.]+)/i.exec(e.stderr);
      return { ok: true, version: m ? m[1] : null };
    }
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}

/** Transcribe a 16 kHz mono WAV. Writes <outBase>.json via whisper and reads it back. */
export async function transcribe(wav: string, outBase: string, timeoutMs = 30 * 60_000): Promise<WhisperResult> {
  if (!existsSync(whisperModel())) throw new WhisperError("no-model", `no model at ${whisperModel()}`);
  try {
    await run(
      whisperArgs({ model: whisperModel(), wav, outBase, threads: Number(process.env.REMORA_WHISPER_THREADS ?? 4), language: process.env.REMORA_WHISPER_LANGUAGE || "auto" }),
      { bin: whisperBin(), timeoutMs },
    );
  } catch (e) {
    if (e instanceof YtDlpError) {
      const kind = e.kind === "not-found" ? "not-found" : e.kind === "timeout" ? "timeout" : "exit";
      throw new WhisperError(kind, e.message.replace(/^yt-dlp/, "whisper"));
    }
    throw e;
  }
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(`${outBase}.json`, "utf8"));
  } catch {
    throw new WhisperError("bad-json", "whisper finished without writing its JSON");
  }
  const result = parseWhisperJson(json);
  if (!result) throw new WhisperError("bad-json", "whisper's JSON did not narrow");
  return result;
}
