/**
 * `npm run remora -- <command> [args]`
 *
 * The maintenance hatch on the side of the machine.
 *   peek <url>   offline: what the glass reads off a pasted URL
 *   info <url>   yt-dlp: what is actually behind the glass
 */
import { parseVideoUrl } from "../../src/remora/core/url.ts";
import { prettyBytes, prettyDuration, prettyHeight } from "../../src/remora/core/pretty.ts";
import type { VideoFormat, VideoMeta } from "../../src/remora/core/meta.ts";
import { YtDlpError, ytDlpBin, ytDlpInfo, ytDlpVersion } from "../../src/remora/ytdlp.ts";

const BANNER = String.raw`
                 ___
   ____  ___  __/ _ \  ___  ____  ___ _      ><(((º>
  / __/ / -_)/ ' ' / \/ _ \/ __/ / _ '/
 /_/    \__//_/_/_/  \___/_/    \_,_/     video vending machine
`;

const [, , command, ...args] = process.argv;

async function main(): Promise<number> {
  switch (command) {
    case "peek": {
      const parsed = args[0] ? parseVideoUrl(args[0]) : null;
      if (!parsed) {
        console.error("peek: give me a URL");
        return 2;
      }
      console.log(JSON.stringify(parsed, null, 2));
      return 0;
    }

    case "info": {
      const parsed = args[0] ? parseVideoUrl(args[0]) : null;
      if (!parsed) {
        console.error("info: give me a URL");
        return 2;
      }
      const target = parsed.canonicalUrl || args[0];
      console.log(BANNER);
      process.stdout.write(`  looking through the glass at ${target} ...`);
      const started = Date.now();
      try {
        const meta = await ytDlpInfo(target);
        process.stdout.write(` ${((Date.now() - started) / 1000).toFixed(1)}s\n\n`);
        printMeta(parsed.provider, meta);
        return 0;
      } catch (e) {
        process.stdout.write("\n\n");
        return printYtDlpError(e);
      }
    }

    case "doctor": {
      // Which binaries would the machine use, and do they answer?
      console.log(BANNER);
      console.log(`  node     ${process.version}`);
      try {
        console.log(`  yt-dlp   ${await ytDlpVersion()}  (${ytDlpBin()})`);
      } catch (e) {
        console.log(`  yt-dlp   ${e instanceof Error ? e.message : String(e)}`);
      }
      return 0;
    }

    case undefined:
    case "help":
      console.log(BANNER);
      console.log("commands:");
      console.log("  peek <url>     what the glass reads off a URL (offline)    [phase 1]");
      console.log("  info <url>     what is behind the glass, via yt-dlp         [phase 1]");
      console.log("  doctor         which binaries the machine would use         [phase 1]");
      console.log("  get  <url>     the VIDEO slot, local                         [phase 2]");
      return 0;

    default:
      console.error(`remora: unknown command "${command}" (try: help)`);
      return 2;
  }
}

function printMeta(provider: string, m: VideoMeta): void {
  const rows: [string, string][] = [
    ["title", m.title],
    ["by", m.uploader ?? "—"],
    ["length", m.isLive ? "LIVE" : prettyDuration(m.duration)],
    ["uploaded", m.uploadDate ?? "—"],
    ["provider", `${provider} (yt-dlp: ${m.extractor}, id ${m.id})`],
    ["page", m.webpageUrl ?? "—"],
    ["thumb", m.thumbnail ?? "—"],
  ];
  for (const [k, v] of rows) {
    console.log(`  ${k.padEnd(9)} ${v}`);
  }

  const shown = pickFormats(m.formats);
  console.log(`\n  formats   ${m.formats.length} total, ${shown.length} shown\n`);
  console.log(`  ${"id".padEnd(8)} ${"ext".padEnd(5)} ${"size".padStart(10)}  ${"video".padEnd(18)} ${"audio".padEnd(10)} ${"bytes".padStart(10)}`);
  for (const f of shown) {
    const size = f.height === null ? "audio" : `${prettyHeight(f.height)}${f.fps && f.fps > 30 ? `${Math.round(f.fps)}` : ""}`;
    console.log(
      `  ${f.formatId.padEnd(8)} ${f.ext.padEnd(5)} ${size.padStart(10)}  ${(f.vcodec ?? "—").slice(0, 18).padEnd(18)} ${(f.acodec ?? "—").slice(0, 10).padEnd(10)} ${prettyBytes(f.bytes, f.bytesApprox).padStart(10)}`,
    );
  }
}

/** The formats a human wants to see: one per height, best bytes first, plus audio-only. */
function pickFormats(formats: VideoFormat[]): VideoFormat[] {
  const byHeight = new Map<string, VideoFormat>();
  for (const f of formats) {
    if (f.vcodec === null && f.acodec === null) continue; // storyboards and the like
    const key = f.height === null ? `audio:${f.ext}` : `${f.height}:${f.ext}`;
    const cur = byHeight.get(key);
    if (!cur || (f.bytes ?? 0) > (cur.bytes ?? 0)) {
      byHeight.set(key, f);
    }
  }
  return [...byHeight.values()].sort((a, b) => (b.height ?? -1) - (a.height ?? -1) || (b.bytes ?? 0) - (a.bytes ?? 0));
}

function printYtDlpError(e: unknown): number {
  if (!(e instanceof YtDlpError)) {
    throw e;
  }
  switch (e.kind) {
    case "not-found":
      console.error(`  OUT OF ORDER: ${e.message}. brew install yt-dlp, or set REMORA_YTDLP_BIN.`);
      return 3;
    case "timeout":
      console.error(`  nothing dropped: ${e.message}`);
      return 4;
    case "exit":
      console.error(`  nothing dropped: ${e.message}`);
      return 1;
    case "bad-json":
      console.error(`  the glass fogged up: ${e.message}`);
      return 1;
  }
}

process.exitCode = await main();
