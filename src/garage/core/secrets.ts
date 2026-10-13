/**
 * Guard 5: secrets are probed by existence and length only, never displayed. Two halves:
 * the environment the agent's process is given (an allowlist, so the ledger's connection
 * string and Remora's keys are simply absent), and a scanner for key shapes in anything
 * the agent reads or says. The scanner reports the shape's name, never the match. Pure.
 */
export const SECRET_SHAPES: readonly { name: string; re: RegExp }[] = [
  { name: "anthropic key", re: /sk-ant-[A-Za-z0-9_-]{8,}/ },
  { name: "stripe key", re: /\b[sr]k_(?:live|test)_[A-Za-z0-9]{8,}/ },
  { name: "stripe webhook secret", re: /\bwhsec_[A-Za-z0-9]{8,}/ },
  { name: "remora card code", re: /\brc_[A-Za-z0-9_-]{32}\b/ },
  { name: "database url with password", re: /postgres(?:ql)?:\/\/[^\s/:]+:[^\s@]+@/ },
  { name: "private key block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "github token", re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}|\bgithub_pat_[A-Za-z0-9_]{20,}/ },
  { name: "aws access key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "cloudflare r2 secret", re: /\bREMORA_R2_SECRET_ACCESS_KEY\s*=\s*\S{16,}/ },
];

/** The names of every shape found in the text. Empty means clean. */
export function findSecretShapes(text: string): string[] {
  const found: string[] = [];
  for (const s of SECRET_SHAPES) {
    if (s.re.test(text)) found.push(s.name);
  }
  return found;
}

/** What the agent's subprocess is allowed to inherit. Everything else is absent, not masked. */
export const ENV_ALLOWLIST: readonly string[] = [
  "PATH",
  "HOME",
  "USER",
  "SHELL",
  "TMPDIR",
  "LANG",
  "LC_ALL",
  "TERM",
  "CLAUDE_CODE_OAUTH_TOKEN",
  "ANTHROPIC_API_KEY",
  "CLAUDE_CONFIG_DIR",
  "GIT_AUTHOR_NAME",
  "GIT_AUTHOR_EMAIL",
  "GIT_COMMITTER_NAME",
  "GIT_COMMITTER_EMAIL",
];

export function agentEnv(env: Record<string, string | undefined>, app = "squaloo-garage/0.1"): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of ENV_ALLOWLIST) {
    const v = env[k];
    if (typeof v === "string" && v.length > 0) out[k] = v;
  }
  out.CLAUDE_AGENT_SDK_CLIENT_APP = app;
  return out;
}

/** Files the agent may never read, whatever the rung: env files, keys, other agents' homes. */
export const SECRET_PATHS: readonly RegExp[] = [
  /(^|\/)\.env(\.|$)/,
  /\.pem$/,
  /\.key$/,
  /(^|\/)\.claude(\/|$)/,
  /(^|\/)\.ssh(\/|$)/,
  /(^|\/)\.remora(\/|$)/,
  /(^|\/)\.squaloo(\/|$)/,
  /(^|\/)\.aws(\/|$)/,
  /(^|\/)\.netrc$/,
];

export function isSecretPath(relOrAbs: string): boolean {
  return SECRET_PATHS.some((re) => re.test(relOrAbs));
}
