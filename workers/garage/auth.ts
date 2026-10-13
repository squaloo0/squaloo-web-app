/**
 * Who the agent runs as. In order: an OAuth token already in the environment, an API key
 * already in the environment, the wrasse token in the macOS Keychain (service
 * `squaloo-garage`, account `wrasse`, stored the way Solomon's seats store theirs), or the
 * host's own Claude Code login. The value is never printed; `doctor` reports source and
 * length only (charter guard 5).
 *
 * I/O edge: one spawn, no shell string.
 */
import { spawnSync } from "node:child_process";

export type Auth = { source: string; length: number; patch: Record<string, string> };

export function resolveAuth(env: Record<string, string | undefined>): Auth {
  const oauth = env.CLAUDE_CODE_OAUTH_TOKEN;
  if (oauth) return { source: "env: CLAUDE_CODE_OAUTH_TOKEN", length: oauth.length, patch: {} };
  const key = env.ANTHROPIC_API_KEY;
  if (key) return { source: "env: ANTHROPIC_API_KEY", length: key.length, patch: {} };
  const fromKeychain = keychainToken();
  if (fromKeychain) return { source: "keychain: squaloo-garage/wrasse", length: fromKeychain.length, patch: { CLAUDE_CODE_OAUTH_TOKEN: fromKeychain } };
  return { source: "host login (whoever this Mac's Claude Code is signed in as)", length: 0, patch: {} };
}

function keychainToken(): string | null {
  if (process.platform !== "darwin") return null;
  const r = spawnSync("security", ["find-generic-password", "-s", "squaloo-garage", "-a", "wrasse", "-w"], { encoding: "utf8" });
  if (r.status !== 0) return null;
  const v = r.stdout.trim();
  return v.length > 0 ? v : null;
}
