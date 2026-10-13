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
 *   runs [n]                the last n run rows
 *   show <id>               one run: its row, its events, its report
 *   halt [on|off]           the HALT file; no argument prints its state
 *   hash                    sha256 of the branch's diff against origin/main, for approve
 *   approve <diff-hash> [--note "..."]   the founder's approval row for one exact diff
 */
import "../../src/garage/env.ts"; // .env.local → process.env, first
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { hostname } from "node:os";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { charterBinding, charterHash, charterVersion } from "../../src/garage/core/charter.ts";
import { PER_DAY_USD, PER_RUN_USD, prettyUsd } from "../../src/garage/core/budget.ts";
import { runLine } from "../../src/garage/core/run.ts";
import { ledgerWired } from "../../src/garage/db/client.ts";
import { approve, claimCommand, enqueueCommand, finishCommand, getRun, listCommands, listEvents, listRuns, migrate, neonLedger, type CommandRow } from "../../src/garage/db/ledger.ts";
import { CHARTER_FILE, HALT_FILE, runOnce } from "./run.ts";
import { HATS, type Hat } from "./hats.ts";
import { resolveAuth } from "./auth.ts";

const BANNER = String.raw`
   _ _ _  ___  ___  ___  ___  ___
  | | | || '_>| .'|<_-<<_-</ ._>      <°)))><
  |__/_/ |_|  |__,|/__//__/\___.      the garage
`;

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const MACHINE = process.env.GARAGE_MACHINE_NAME || hostname().toLowerCase().split(".")[0];
const MODEL = process.env.GARAGE_MODEL || "claude-sonnet-5-5";

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
          const c = await claimCommand(MACHINE);
          if (c) {
            console.log(`  command #${c.id} · ${c.hat}${c.ticket ? ` · ${c.ticket}` : ""} · from ${c.createdBy}`);
            const hat = HATS[c.hat];
            if (!hat) {
              await finishCommand(c.id, "failed", null);
              console.log(`  no hat named ${c.hat}; marked failed`);
            } else {
              let r: Awaited<ReturnType<typeof oneRun>> | null = null;
              try {
                r = await oneRun(c.hat, hat, { prompt: c.prompt, ticket: c.ticket, model: MODEL, commandId: c.id });
              } finally {
                await finishCommand(c.id, r && r.status === "done" ? "done" : "failed", r?.id ?? null);
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
      const h = diffHash();
      if (!h) {
        console.log("no diff against origin/main");
        return 1;
      }
      console.log(h);
      return 0;
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
      console.log("  garage doctor | migrate | run [hat] | work [--once] | queue | command <hat> | runs [n] | show <id> | halt [on|off] | hash | approve <hash>");
      return command ? 2 : 0;
    }
  }
}

async function oneRun(hatName: string, hat: Hat, o: { prompt: string | null; ticket: string | null; model: string; commandId: number | null }) {
  const auth = resolveAuth(process.env);
  console.log(`  ${MACHINE} · hat ${hatName} · rung ${hat.rung} · ${o.model} · auth ${auth.source}`);
  const started = Date.now();
  const r = await runOnce(
    {
      now: () => new Date(),
      machine: MACHINE,
      cwd: REPO,
      exists: existsSync,
      readFile: (p) => readFileSync(p, "utf8"),
      env: { ...process.env, ...auth.patch },
      ledger: neonLedger,
      query,
      log: (line) => console.log(`  · ${line}`),
    },
    { hat: hatName, prompt: o.prompt ?? hat.prompt, rung: hat.rung, ticket: o.ticket, model: o.model, maxTurns: hat.maxTurns, diffHash: null, commandId: o.commandId },
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

function commandLine(c: CommandRow): string {
  return [`#${c.id}`, c.createdAt.slice(0, 16).replace("T", " ") + "Z", c.hat, c.ticket ?? "", c.status, c.pickedBy ? `on ${c.pickedBy}` : "", c.runId ? `run ${c.runId.slice(0, 8)}` : "", c.prompt ? `"${c.prompt.slice(0, 50)}${c.prompt.length > 50 ? "…" : ""}"` : ""]
    .filter((x) => x.length > 0)
    .join(" · ");
}

function readCharter(): string {
  return readFileSync(join(REPO, CHARTER_FILE), "utf8");
}

/** sha256 of the branch's diff against origin/main, the thing an approval row names. */
function diffHash(): string | null {
  const r = spawnSync("git", ["diff", "origin/main...HEAD"], { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 || r.stdout.length === 0) return null;
  return createHash("sha256").update(r.stdout, "utf8").digest("hex");
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
