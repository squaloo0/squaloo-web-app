/**
 * `npm run garage -- <command> [args]`
 *
 * The door to the cleaning station.
 *   doctor                  charter version and hash, auth source, ledger, HALT, SDK
 *   migrate                 apply src/garage/db/migrations to Neon
 *   run [hat] [--ticket T] [--model M] [--prompt "..."]   one run of wrasse, headless
 *   work [--once] [--every S]   pick up dashboard commands and run them, forever or once
 *   queue [n]               the last n commands
 *   command <hat> [--prompt "..."] [--ticket T]   queue a command from here instead of the dashboard
 *   hits [days]             the instrument: visitors by kind, day, path, family
 *   orders                  the standing orders; `orders add <hat> --every H [--ticket T] [--prompt ...]`, `orders on|off|rm <id>`
 *   library pull            regenerate src/garage/LIBRARY.md from the Notion library (token on this host only),
 *                           then check the disk mirror against the rows (rule 19) and name every disagreement
 *   library fetch           the batch hunt: download every row's primary that is not mirrored yet, hash it,
 *                           write the mirror tag back to the row's ID; print the URLs that refused, for the hand hunt
 *   library sums            rewrite ~/.garage/library/SHA256SUMS from what is on disk (after a hand hunt)
 *   library file <run-id>   file a run's report as a page under the Notion report page
 *   library import <csv>    a CoWork seed batch into the Notion library, one page per row; rows already
 *                           present (same name) are skipped, so a re-run is safe
 *   runs [n]                the last n run rows
 *   show <id>               one run: its row, its events, its report
 *   halt [on|off]           the HALT file; no argument prints its state
 *   hash                    sha256 of the branch's diff against origin/main, for approve
 *   approve <diff-hash> [--note "..."]   the founder's approval row for one exact diff
 *   publish <run-id>        push an approved run's branch and open its PR (no model involved)
 */
import "../../src/garage/env.ts"; // .env.local → process.env, first
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { hostname } from "node:os";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { charterBinding, charterHash, charterVersion } from "../../src/garage/core/charter.ts";
import { PER_DAY_USD, PER_RUN_USD, prettyUsd } from "../../src/garage/core/budget.ts";
import { runLine } from "../../src/garage/core/run.ts";
import { ledgerWired } from "../../src/garage/db/client.ts";
import { addOrder, approve, claimCommand, claimOrderTick, deleteOrder, enqueueCommand, finishCommand, getRun, hitsSummary, listCommands, listEvents, listOrders, listRuns, migrate, neonLedger, noteRun, setOrderEnabled, setPrUrl, type CommandRow } from "../../src/garage/db/ledger.ts";
import { dueOrders, ORDERABLE_HATS, orderLine, parseEveryHours } from "../../src/garage/core/orders.ts";
import { libraryMarkdown } from "../../src/garage/core/notion.ts";
import { createLibraryPage, fetchPrimary, fileReport, notionWired, pullLibrary, setIdent } from "../../src/garage/notion.ts";
import { parseCsv } from "../../src/garage/core/csv.ts";
import { seedChildren, seedPage, seedProperties } from "../../src/garage/core/seed.ts";
import { checkMirror, idWithMirror, mirrorFileName, mirrorOf, parseSums, sumsText } from "../../src/garage/core/library.ts";
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync } from "node:fs";
import { hitsLines } from "../../src/garage/core/hits.ts";
import { CHARTER_FILE, HALT_FILE, runOnce } from "./run.ts";
import { HATS, type Hat } from "./hats.ts";
import { commitAll, diffHash, openPr, prepareWorktree, push } from "./git.ts";
import { branchFor, prBody, prTitle, publishVerdict, slugify } from "../../src/garage/core/propose.ts";
import { resolveAuth } from "./auth.ts";

const BANNER = String.raw`
   _ _ _  ___  ___  ___  ___  ___
  | | | || '_>| .'|<_-<<_-</ ._>      <°)))><
  |__/_/ |_|  |__,|/__//__/\___.      the garage
`;

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const MACHINE = process.env.GARAGE_MACHINE_NAME || hostname().toLowerCase().split(".")[0];
const MODEL = process.env.GARAGE_MODEL || "claude-sonnet-5-5";
/** Where the founder mirrors the library's primaries on this Mac; readable by the agent, never written. */
const LIBRARY_ROOT = process.env.GARAGE_LIBRARY_ROOT || join(process.env.HOME ?? "", ".garage", "library");

const [, , command, ...rawArgs] = process.argv;
const { args, flags } = splitFlags(rawArgs);

async function main(): Promise<number> {
  switch (command) {
    case "doctor": {
      console.log(BANNER);
      const text = readCharter();
      const auth = resolveAuth(process.env);
      const sdk = JSON.parse(readFileSync(join(REPO, "node_modules/@anthropic-ai/claude-agent-sdk/package.json"), "utf8")) as { version: string };
      console.log(`  machine   ${MACHINE}`);
      console.log(`  charter   v${charterVersion(text) ?? "?"} · ${charterHash(text).slice(0, 12)} · ${charterBinding(text) ? "binding" : "draft, not yet binding"}`);
      console.log(`  model     ${MODEL}`);
      console.log(`  budget    ${prettyUsd(PER_RUN_USD)} per run · ${prettyUsd(PER_DAY_USD)} per day`);
      console.log(`  auth      ${auth.source}${auth.length ? ` · length ${auth.length}` : ""}`);
      console.log(`  ledger    ${ledgerWired() ? "wired" : "NEON_DATABASE_URL is not set"}`);
      console.log(`  halt      ${existsSync(join(REPO, HALT_FILE)) ? "ON: " + HALT_FILE + " is present, runs exit at launch" : "off"}`);
      console.log(`  sdk       @anthropic-ai/claude-agent-sdk ${sdk.version}`);
      console.log(`  hats      ${Object.keys(HATS).join(", ")}`);
      const nw = notionWired();
      console.log(`  notion    token ${nw.token ? "present" : "absent"} · library db ${nw.db ? "set" : "unset"} · report page ${nw.reportPage ? "set" : "unset"}`);
      console.log(`  library   ${LIBRARY_ROOT}${existsSync(LIBRARY_ROOT) ? "" : " (not on this Mac)"}`);
      if (ledgerWired()) {
        const spent = await neonLedger.spentTodayUsd();
        console.log(`  today     ${prettyUsd(spent)} spent of ${prettyUsd(PER_DAY_USD)}`);
      }
      return 0;
    }
    case "migrate": {
      const dir = join(REPO, "src/garage/db/migrations");
      const names = (await readdir(dir)).filter((n) => n.endsWith(".sql"));
      const files = await Promise.all(names.map(async (name) => ({ name, text: await readFile(join(dir, name), "utf8") })));
      const applied = await migrate(files);
      console.log(applied.length ? `applied: ${applied.join(", ")}` : "nothing to apply");
      return 0;
    }
    case "run": {
      const hatName = args[0] ?? "report";
      const hat = HATS[hatName];
      if (!hat) {
        console.error(`run: no hat named ${hatName}; have ${Object.keys(HATS).join(", ")}`);
        return 2;
      }
      console.log(BANNER);
      const r = await oneRun(hatName, hat, {
        prompt: typeof flags.prompt === "string" ? flags.prompt : null,
        ticket: typeof flags.ticket === "string" ? flags.ticket : null,
        model: typeof flags.model === "string" ? flags.model : MODEL,
        commandId: null,
      });
      return r.status === "done" ? 0 : 1;
    }
    case "work": {
      const every = Math.max(5, Number(flags.every ?? 15)) * 1000;
      console.log(BANNER);
      console.log(`  ${MACHINE} · working the queue${flags.once ? " once" : ` every ${every / 1000}s`} · ctrl-c to stop`);
      for (;;) {
        if (existsSync(join(REPO, HALT_FILE))) {
          console.log(`  HALT is on; not picking anything up`);
        } else {
          // Standing orders: a due order becomes a queued command, once, whichever host ticks first.
          for (const o of dueOrders(await listOrders(), new Date())) {
            if (await claimOrderTick(o.id, o.everyHours)) {
              const c = await enqueueCommand({ hat: o.hat, prompt: o.prompt, ticket: o.ticket, by: `order #${o.id}` });
              console.log(`  order #${o.id} (${o.hat}) due → command #${c.id}`);
            }
          }
          const c = await claimCommand(MACHINE);
          if (c) {
            console.log(`  command #${c.id} · ${c.hat}${c.ticket ? ` · ${c.ticket}` : ""} · from ${c.createdBy}`);
            const hat = HATS[c.hat];
            if (c.hat === "publish") {
              const ok = await publishRun(c.prompt ?? "");
              await finishCommand(c.id, ok ? "done" : "failed", c.prompt && /^[0-9a-f-]{8,36}$/.test(c.prompt) ? (await getRun(c.prompt))?.id ?? null : null);
            } else if (!hat) {
              await finishCommand(c.id, "failed", null);
              console.log(`  no hat named ${c.hat}; marked failed`);
            } else {
              let r: Awaited<ReturnType<typeof oneRun>> | null = null;
              try {
                r = await oneRun(c.hat, hat, { prompt: c.prompt, ticket: c.ticket, model: MODEL, commandId: c.id });
              } finally {
                await finishCommand(c.id, r && r.status === "done" ? "done" : "failed", r?.id ?? null);
              }
              // A finished study or report is filed in Notion by the harness, when this host can.
              if (r && r.status === "done" && r.report && hat.rung === 0) {
                const nw = notionWired();
                if (nw.token && nw.reportPage) {
                  try {
                    const url = await fileReport(`${c.hat}${c.ticket ? ` ${c.ticket}` : ""} · run ${r.id.slice(0, 8)} · ${new Date().toISOString().slice(0, 10)}`, r.report);
                    await noteRun(r.id, `filed in Notion: ${url}`);
                    console.log(`  filed in Notion: ${url}`);
                  } catch (e) {
                    await noteRun(r.id, `Notion filing failed: ${e instanceof Error ? e.message : String(e)}`);
                    console.log(`  Notion filing failed: ${e instanceof Error ? e.message : String(e)}`);
                  }
                }
              }
            }
            if (flags.once) return 0;
            continue;
          }
          if (flags.once) {
            console.log("  the queue is empty");
            return 0;
          }
        }
        await new Promise((res) => setTimeout(res, every));
      }
    }
    case "queue": {
      const rows = await listCommands(Number(args[0] ?? 20));
      if (rows.length === 0) console.log("no commands yet");
      for (const c of rows) console.log(commandLine(c));
      return 0;
    }
    case "command": {
      const hatName = args[0];
      if (!hatName || !HATS[hatName]) {
        console.error(`command: which hat? have ${Object.keys(HATS).join(", ")}`);
        return 2;
      }
      const c = await enqueueCommand({ hat: hatName, prompt: typeof flags.prompt === "string" ? flags.prompt : null, ticket: typeof flags.ticket === "string" ? flags.ticket : null, by: `${process.env.USER ?? "someone"}@${MACHINE}` });
      console.log(`queued #${c.id}; a host running \`garage work\` will pick it up`);
      return 0;
    }
    case "hits": {
      const s = await hitsSummary(Number(args[0] ?? 7));
      for (const line of hitsLines(s)) console.log(line);
      return 0;
    }
    case "orders": {
      const sub = args[0];
      if (sub === "add") {
        const hat = args[1];
        const every = parseEveryHours(typeof flags.every === "string" ? flags.every : undefined);
        if (!hat || !ORDERABLE_HATS.includes(hat) || every === null) {
          console.error(`orders add <${ORDERABLE_HATS.join("|")}> --every <hours 1..336> [--ticket T] [--prompt "..."]`);
          return 2;
        }
        const o = await addOrder({ hat, prompt: typeof flags.prompt === "string" ? flags.prompt : null, ticket: typeof flags.ticket === "string" ? flags.ticket : null, everyHours: every, by: `${process.env.USER ?? "someone"}@${MACHINE}` });
        console.log(orderLine(o));
        return 0;
      }
      if ((sub === "on" || sub === "off" || sub === "rm") && args[1] && /^\d+$/.test(args[1])) {
        if (sub === "rm") await deleteOrder(Number(args[1]));
        else await setOrderEnabled(Number(args[1]), sub === "on");
        console.log(`order #${args[1]} ${sub}`);
        return 0;
      }
      const orders = await listOrders();
      if (orders.length === 0) console.log("no standing orders");
      for (const o of orders) console.log(orderLine(o));
      return 0;
    }
    case "library": {
      if (args[0] === "pull") {
        const { rows, databaseId } = await pullLibrary();
        const md = libraryMarkdown(rows, new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC", databaseId);
        writeFileSync(join(REPO, "src/garage/LIBRARY.md"), md);
        console.log(`pulled ${rows.length} source${rows.length === 1 ? "" : "s"} into src/garage/LIBRARY.md`);
        for (const r of rows) console.log(`  ${r.name} · ${r.status || "unread"}${r.scrub.length ? ` · scrub: ${r.scrub.join(", ")}` : ""}`);
        const check = checkMirror(rows, readSums(), new Map(rows.map((r) => [r.id, r.ident ?? ""])));
        console.log(`mirror: ${check.ok.length} verified · ${check.unmirrored.length} not yet mirrored · ${check.missing.length} missing on disk · ${check.mismatch.length} hash mismatch · ${check.orphans.length} orphan file${check.orphans.length === 1 ? "" : "s"}`);
        for (const m of check.missing) console.log(`  MISSING  ${m.file}  (${m.row}); put it under ${LIBRARY_ROOT} and run library sums`);
        for (const m of check.mismatch) console.log(`  MISMATCH ${m.file}  row says ${m.row12}, disk says ${m.disk}  (${m.row})`);
        for (const o of check.orphans) console.log(`  ORPHAN   ${o}  (no row names it)`);
        return check.mismatch.length ? 1 : 0;
      }
      if (args[0] === "fetch") {
        const { rows } = await pullLibrary();
        mkdirSync(LIBRARY_ROOT, { recursive: true });
        const sums = readSums();
        const refused: { name: string; url: string; reason: string }[] = [];
        let got = 0;
        for (const [i, r] of rows.entries()) {
          if (!r.url || mirrorOf(r.ident ?? "")) continue;
          const res = await fetchPrimary(r.url);
          if (!res.ok) {
            refused.push({ name: r.name, url: r.url, reason: res.reason });
            console.log(`  refused  ${r.name} · ${res.reason}`);
            continue;
          }
          const file = mirrorFileName(i + 1, r.name, res.contentType, r.url);
          const sha = createHash("sha256").update(res.bytes).digest("hex");
          writeFileSync(join(LIBRARY_ROOT, file), res.bytes);
          sums.set(file, sha);
          await setIdent(r.id, idWithMirror(r.ident ?? "", file, sha));
          got++;
          console.log(`  mirrored ${file} · ${(res.bytes.length / 1024).toFixed(0)} KB · sha256 ${sha.slice(0, 12)}`);
        }
        writeFileSync(join(LIBRARY_ROOT, "SHA256SUMS"), sumsText([...sums].map(([file, sha256]) => ({ file, sha256 }))));
        console.log(`fetched ${got}; ${refused.length} for the hand hunt${refused.length ? ":" : ""}`);
        for (const r of refused) console.log(`  ${r.url}`);
        if (refused.length) console.log(`save each under ${LIBRARY_ROOT} as S<n>-<slug>.<ext>, then run: garage library sums, then write the tag into the row's ID (library sums prints it)`);
        return 0;
      }
      if (args[0] === "sums") {
        mkdirSync(LIBRARY_ROOT, { recursive: true });
        const entries = readdirSync(LIBRARY_ROOT)
          .filter((f) => /^S\d+-/.test(f))
          .map((file) => ({ file, sha256: createHash("sha256").update(readFileSync(join(LIBRARY_ROOT, file))).digest("hex") }));
        writeFileSync(join(LIBRARY_ROOT, "SHA256SUMS"), sumsText(entries));
        console.log(`${entries.length} file${entries.length === 1 ? "" : "s"} summed into ${join(LIBRARY_ROOT, "SHA256SUMS")}`);
        for (const e of entries) console.log(`  ${e.file} · sha256 ${e.sha256.slice(0, 12)}   (ID tag: ${e.file} · sha256 ${e.sha256.slice(0, 12)})`);
        return 0;
      }
      if (args[0] === "file" && args[1]) {
        const r = await getRun(args[1]);
        if (!r || !r.report) {
          console.error("library file: no such run, or no report");
          return 1;
        }
        const url = await fileReport(`${r.hat}${r.ticket ? ` ${r.ticket}` : ""} · run ${r.id.slice(0, 8)} · ${r.startedAt.slice(0, 10)}`, r.report);
        await noteRun(r.id, `filed in Notion: ${url}`);
        console.log(`filed: ${url}`);
        return 0;
      }
      if (args[0] === "import" && args[1]) {
        const rows = parseCsv(readFileSync(resolve(args[1]), "utf8"));
        const pages = rows.map(seedPage).filter((p) => p !== null);
        const existing = new Set((await pullLibrary()).rows.map((r) => r.name.trim().toLowerCase()));
        let made = 0;
        let skipped = 0;
        for (const p of pages) {
          if (existing.has(p.name.trim().toLowerCase())) {
            skipped++;
            continue;
          }
          const url = await createLibraryPage(seedProperties(p), seedChildren(p));
          made++;
          console.log(`  + ${p.name.slice(0, 80)}${p.scrub.length ? ` · scrub ${p.scrub.length}` : ""}${p.lane ? ` · ${p.lane}` : ""}  ${url}`);
        }
        console.log(`imported ${made}, skipped ${skipped} already present, of ${pages.length} rows; now run library fetch, then library pull`);
        return 0;
      }
      console.error("library pull | fetch | sums | file <run-id> | import <csv>");
      return 2;
    }
    case "runs": {
      const rows = await listRuns(Number(args[0] ?? 20));
      if (rows.length === 0) console.log("no runs yet; the station is quiet");
      for (const r of rows) console.log(runLine(r));
      return 0;
    }
    case "show": {
      if (!args[0]) {
        console.error("show: which run?");
        return 2;
      }
      const r = await getRun(args[0]);
      if (!r) {
        console.error(`show: no run starting ${args[0]}`);
        return 1;
      }
      console.log(runLine(r));
      console.log(`model ${r.model} · ticket ${r.ticket ?? "none"} · finished ${r.finishedAt ?? "not yet"}`);
      if (r.error) console.log(`error: ${r.error}`);
      console.log("");
      for (const e of await listEvents(r.id)) console.log(`  ${e.at.slice(11, 19)} ${e.kind.padEnd(5)} ${(e.tool ?? "").padEnd(8)} ${e.detail}`);
      if (r.report) {
        console.log("");
        console.log(r.report);
      }
      return 0;
    }
    case "halt": {
      const file = join(REPO, HALT_FILE);
      if (args[0] === "on") {
        writeFileSync(file, `halted by ${process.env.USER ?? "someone"} on ${MACHINE} at ${new Date().toISOString()}\n`);
        console.log(`HALT on: ${HALT_FILE} written; every run on this checkout exits at launch`);
      } else if (args[0] === "off") {
        if (existsSync(file)) unlinkSync(file);
        console.log("HALT off");
      } else {
        console.log(existsSync(file) ? `HALT on: ${readFileSync(file, "utf8").trim()}` : "HALT off");
      }
      return 0;
    }
    case "hash": {
      const h = await diffHash(REPO);
      if (!h) {
        console.log("no diff against origin/main");
        return 1;
      }
      console.log(h);
      return 0;
    }
    case "publish": {
      if (!args[0]) {
        console.error("publish: which run?");
        return 2;
      }
      return (await publishRun(args[0])) ? 0 : 1;
    }
    case "approve": {
      const h = args[0];
      if (!h || !/^[0-9a-f]{64}$/.test(h)) {
        console.error("approve: give me the 64-hex diff hash from `garage hash`");
        return 2;
      }
      await approve(h, process.env.USER ?? MACHINE, typeof flags.note === "string" ? flags.note : null, typeof flags.run === "string" ? flags.run : null);
      console.log(`approved diff ${h.slice(0, 12)}; a push of exactly that diff may pass the gate`);
      return 0;
    }
    default: {
      console.log(BANNER);
      console.log("  garage doctor | migrate | run [hat] | work [--once] | queue | command <hat> | orders | library pull|file | hits [days] | runs [n] | show <id> | halt [on|off] | hash | approve <hash> | publish <run>");
      return command ? 2 : 0;
    }
  }
}

async function oneRun(hatName: string, hat: Hat, o: { prompt: string | null; ticket: string | null; model: string; commandId: number | null }) {
  const auth = resolveAuth(process.env);
  console.log(`  ${MACHINE} · hat ${hatName} · rung ${hat.rung} · ${o.model} · auth ${auth.source}`);
  // Rung 1 works on its own branch in its own worktree; the primary checkout is a person's.
  let cwd = REPO;
  let branch: string | null = null;
  if (hat.rung >= 1) {
    branch = branchFor(hat.kind ?? "feat", o.ticket ? `${o.ticket}-${slugify((o.prompt ?? hatName).slice(0, 40))}` : (o.prompt ?? hatName).slice(0, 40));
    cwd = await prepareWorktree(REPO, branch);
    console.log(`  branch ${branch} · worktree ${cwd}`);
  }
  const started = Date.now();
  const r = await runOnce(
    {
      now: () => new Date(),
      machine: MACHINE,
      cwd,
      exists: existsSync,
      readFile: (p) => readFileSync(p, "utf8"),
      env: { ...process.env, ...auth.patch, GIT_AUTHOR_NAME: "wrasse", GIT_AUTHOR_EMAIL: "wrasse-agent@squaloo.com", GIT_COMMITTER_NAME: "wrasse", GIT_COMMITTER_EMAIL: "wrasse-agent@squaloo.com" },
      ledger: neonLedger,
      query,
      log: (line) => console.log(`  · ${line}`),
      git: { commitAll, diffHash },
      readRoots: existsSync(LIBRARY_ROOT) ? [LIBRARY_ROOT] : [],
    },
    { hat: hatName, prompt: o.prompt ? `${hat.prompt}\n\n## The command\n\n${o.prompt}` : hat.prompt, rung: hat.rung, ticket: o.ticket, model: o.model, maxTurns: hat.maxTurns, diffHash: null, commandId: o.commandId, branch },
  );
  const secs = Math.round((Date.now() - started) / 1000);
  console.log("");
  console.log(`  run ${r.id.slice(0, 8)} · ${r.status}${r.haltReason ? `: ${r.haltReason}` : ""} · ${prettyUsd(r.costUsd)} · ${r.turns} turn${r.turns === 1 ? "" : "s"} · ${r.toolCalls} tool${r.toolCalls === 1 ? "" : "s"} · ${r.denials} refused · ${secs}s`);
  if (r.error) console.log(`  error: ${r.error}`);
  if (r.report) {
    console.log("");
    console.log(r.report.split("\n").map((l) => "  " + l).join("\n"));
  }
  console.log("");
  return r;
}

/**
 * The harness half of the gate: re-hash the branch now, compare with the row and the
 * approval, then push and open the PR with the run's own gate comment. No model involved.
 */
async function publishRun(idOrPrefix: string): Promise<boolean> {
  const r = await getRun(idOrPrefix);
  if (!r) {
    console.log(`  publish: no run starting ${idOrPrefix}`);
    return false;
  }
  if (!r.branch) {
    console.log(`  publish: run ${r.id.slice(0, 8)} has no branch`);
    return false;
  }
  if (r.prUrl) {
    console.log(`  publish: already published at ${r.prUrl}`);
    return true;
  }
  const cwd = await prepareWorktree(REPO, r.branch);
  const current = await diffHash(cwd);
  const v = publishVerdict({ recordedHash: r.diffHash, currentHash: current, approved: await neonLedger.approvedHashes(), verdict: r.verdict });
  if (!v.ok) {
    await noteRun(r.id, `publish refused: ${v.reason}`);
    console.log(`  publish refused: ${v.reason}`);
    return false;
  }
  const pushed = await push(cwd, r.branch);
  if (pushed.status !== 0) {
    await noteRun(r.id, `push failed: ${pushed.stderr.trim().slice(0, 300)}`);
    console.log(`  push failed: ${pushed.stderr.trim()}`);
    return false;
  }
  const url = await openPr(cwd, prTitle(r.report, r.branch), prBody({ runId: r.id, report: r.report, charterVersion: r.charterVersion, charterHash: r.charterHash, costUsd: r.costUsd, diffHash: current! }));
  await setPrUrl(r.id, url);
  console.log(`  published ${r.branch} → ${url}`);
  return true;
}

function readSums(): Map<string, string> {
  try {
    return parseSums(readFileSync(join(LIBRARY_ROOT, "SHA256SUMS"), "utf8"));
  } catch {
    return new Map();
  }
}

function commandLine(c: CommandRow): string {
  return [`#${c.id}`, c.createdAt.slice(0, 16).replace("T", " ") + "Z", c.hat, c.ticket ?? "", c.status, c.pickedBy ? `on ${c.pickedBy}` : "", c.runId ? `run ${c.runId.slice(0, 8)}` : "", c.prompt ? `"${c.prompt.slice(0, 50)}${c.prompt.length > 50 ? "…" : ""}"` : ""]
    .filter((x) => x.length > 0)
    .join(" · ");
}

function readCharter(): string {
  return readFileSync(join(REPO, CHARTER_FILE), "utf8");
}

function splitFlags(list: string[]): { args: string[]; flags: Record<string, string | true> } {
  const args: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = list[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      args.push(a);
    }
  }
  return { args, flags };
}

main().then(
  (code) => process.exit(code),
  (e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  },
);
