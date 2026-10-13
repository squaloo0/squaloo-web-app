/**
 * `.env.local` → process.env for the Garage's CLI and worker, the way Remora's does it,
 * so a Mac runs the same way Next does. Values already in the environment win. The agent's
 * subprocess never sees this environment; it gets the allowlist in core/secrets.ts.
 *
 * I/O edge. Import it first.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadEnvLocal(file = ".env.local"): string[] {
  let text: string;
  try {
    text = readFileSync(resolve(process.cwd(), file), "utf8");
  } catch {
    return [];
  }
  const loaded: string[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
      loaded.push(key);
    }
  }
  return loaded;
}

loadEnvLocal();
