"use server";
/**
 * The newsletter signup (SQU-427): a server action, one table, nothing else
 * stored. The caller's address keys an in-memory limiter for ten minutes and
 * is never written anywhere. A script that fills the honeypot gets the same
 * "you're on the list" a person gets, and nothing is saved.
 */
import { headers } from "next/headers";
import { neon } from "@neondatabase/serverless";
import { checkSignup, makeRateLimiter } from "./_lib/meridian";

export type SubscribeState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string; email: string; name: string };

const allow = makeRateLimiter(5, 10 * 60 * 1000);

const MESSAGES = {
  email: "That email doesn’t look complete. Check it and try again.",
  consent: "Tick the box to say you want the emails.",
  name: "That name is too long. Leave it shorter, or leave it out.",
} as const;

export async function subscribe(_prev: SubscribeState, form: FormData): Promise<SubscribeState> {
  const email = String(form.get("email") ?? "");
  const name = String(form.get("name") ?? "");
  const check = checkSignup({
    email,
    name,
    consent: form.get("consent"),
    website: form.get("website"),
    src: form.get("src"),
  });
  if (!check.ok) {
    if (check.reason === "honeypot") return { status: "ok" };
    return { status: "error", message: MESSAGES[check.reason], email, name };
  }

  const h = await headers();
  const caller = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  if (!allow(caller)) {
    return { status: "error", message: "Too many tries from here. Wait a few minutes, or write to marshal@squaloo.com.", email, name };
  }

  const url = process.env.NEON_DATABASE_URL;
  if (!url) {
    return { status: "error", message: "Signups aren’t connected yet. Write to marshal@squaloo.com and I’ll add you by hand.", email, name };
  }
  try {
    const sql = neon(url);
    // Idempotent: a second signup with the same email changes nothing and still reads as success.
    await sql`INSERT INTO subscribers (email, name, source, consent) VALUES (${check.email}, ${check.name}, ${check.src}, true) ON CONFLICT (email) DO NOTHING`;
    return { status: "ok" };
  } catch {
    return {
      status: "error",
      message: "Couldn’t save that just now. Your email is still in the box: try again, or write to marshal@squaloo.com.",
      email,
      name,
    };
  }
}
