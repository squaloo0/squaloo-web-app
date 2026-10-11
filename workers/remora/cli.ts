/**
 * `npm run remora -- <command> [args]`
 *
 * The maintenance hatch on the side of the machine. Phase 0: it opens and says hello.
 */
import { parseVideoUrl } from "../../src/remora/core/url.ts";

const BANNER = String.raw`
   ____  ___  __ _  ___  ____  ___ _
  / __ \/ _ \/  ' \/ _ \/ __/ / _ '/
 /_/ /_/\__/_/_/_/\___/_/   \_,_/   video vending machine
`;

const [, , command, ...args] = process.argv;

switch (command) {
  case "peek": {
    const parsed = args[0] ? parseVideoUrl(args[0]) : null;
    if (!parsed) {
      console.error("peek: give me a URL");
      process.exit(2);
    }
    console.log(JSON.stringify(parsed, null, 2));
    break;
  }
  case undefined:
  case "help":
    console.log(BANNER);
    console.log("commands:");
    console.log("  peek <url>     what is behind the glass (offline parse)   [phase 0]");
    console.log("  info <url>     metadata via yt-dlp                         [phase 1]");
    console.log("  get  <url>     the VIDEO slot, local                       [phase 2]");
    break;
  default:
    console.error(`remora: unknown command "${command}" (try: help)`);
    process.exit(2);
}
