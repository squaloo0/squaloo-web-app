import { test } from "node:test";
import assert from "node:assert/strict";
import { agentEnv, findSecretShapes, isSecretPath } from "./secrets.ts";

test("guard 5: a planted key shape is found by name, never by value", () => {
  const planted = "the key is sk_live_abcdefghijklmnop1234 and that is all";
  assert.deepEqual(findSecretShapes(planted), ["stripe key"]);
  assert.deepEqual(findSecretShapes("NEON_DATABASE_URL=postgresql://user:hunter2@ep-x.neon.tech/db"), ["database url with password"]);
  assert.deepEqual(findSecretShapes("-----BEGIN PRIVATE KEY-----\nMC4C"), ["private key block"]);
  assert.deepEqual(findSecretShapes("rc_" + "a".repeat(32)), ["remora card code"]);
  assert.deepEqual(findSecretShapes("sk-ant-oat01-" + "x".repeat(40)), ["anthropic key"]);
  assert.deepEqual(findSecretShapes("github_pat_" + "x".repeat(30)), ["github token"]);
});

test("guard 5: ordinary text and short prefixes are clean", () => {
  assert.deepEqual(findSecretShapes("the coin slot takes rc_ codes; Stripe keys start with sk_live_"), []);
  assert.deepEqual(findSecretShapes("postgresql://ep-x.neon.tech/db?sslmode=require"), [], "a url without a password is a hostname, not a secret");
  assert.deepEqual(findSecretShapes(""), []);
});

test("guard 5: the agent's environment is an allowlist, so the ledger's url is simply absent", () => {
  const env = agentEnv({
    PATH: "/opt/homebrew/bin:/usr/bin",
    HOME: "/Users/wrasse",
    NEON_DATABASE_URL: "postgresql://u:p@h/db",
    REMORA_R2_SECRET_ACCESS_KEY: "x".repeat(40),
    STRIPE_SECRET_KEY: "sk_live_" + "x".repeat(20),
    REMORA_ADMIN_TOKEN: "t",
    CLAUDE_CODE_OAUTH_TOKEN: "sk-ant-oat01-" + "x".repeat(40),
    EMPTY: "",
  });
  assert.deepEqual(Object.keys(env).sort(), ["CLAUDE_AGENT_SDK_CLIENT_APP", "CLAUDE_CODE_OAUTH_TOKEN", "HOME", "PATH"]);
  assert.equal(env.CLAUDE_AGENT_SDK_CLIENT_APP, "squaloo-garage/0.1");
});

test("guard 5: env files and key material are secret paths; the site is not", () => {
  for (const p of [".env.local", "/Users/x/repo/.env", ".env.production", "keys/receipt.pem", "/Users/x/.claude/settings.json", "/Users/x/.ssh/id_ed25519", "/Users/x/.remora/models/x.bin"]) {
    assert.equal(isSecretPath(p), true, p);
  }
  for (const p of ["src/app/page.tsx", "README.md", "src/remora/env.ts", "public/environment.png", "content/devlog/x.md"]) {
    assert.equal(isSecretPath(p), false, p);
  }
});
