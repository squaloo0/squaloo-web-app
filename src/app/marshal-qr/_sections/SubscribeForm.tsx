"use client";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { subscribe, type SubscribeState } from "../actions";
import { normalizeSource } from "../_lib/meridian";
import { ACTION } from "./ui";

const INITIAL: SubscribeState = { status: "idle" };
const FIELD =
  "min-h-11 w-full rounded-xl border border-sq-rule bg-sq-ground px-4 py-3 text-base text-sq-ink placeholder:text-sq-label focus-visible:outline focus-visible:outline-2 focus-visible:outline-solomon-blue";

export default function SubscribeForm() {
  const [state, action, pending] = useActionState(subscribe, INITIAL);
  // The page is static; the source rides in from /qr/<src> as ?src= and is read here, on the client.
  const src = normalizeSource(useSearchParams().get("src"));

  if (state.status === "ok") {
    return (
      <p role="status" className="m-0 rounded-xl border border-sq-rule bg-sq-ground p-5 text-lg leading-[1.5]">
        You’re on the list: build progress and news, about monthly. One click to leave.
      </p>
    );
  }

  const keep = state.status === "error" ? state : { email: "", name: "" };
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="src" value={src} />
      {/* The honeypot: hidden from people and from screen readers; a form-filling script fills it. */}
      <div aria-hidden="true" className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-sq-label">Email</span>
        <input className={FIELD} type="email" name="email" required autoComplete="email" inputMode="email" defaultValue={keep.email} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-sq-label">Name (optional)</span>
        <input className={FIELD} type="text" name="name" autoComplete="name" maxLength={120} defaultValue={keep.name} />
      </label>
      <label className="flex items-start gap-3 leading-[1.5]">
        <input type="checkbox" name="consent" required className="mt-1 h-5 w-5 accent-[#0a369d]" />
        <span>Send me build progress and news, about monthly. One click to leave.</span>
      </label>
      {state.status === "error" ? (
        <p role="alert" className="m-0 rounded-lg border-l-4 border-spiral-red bg-sq-ground px-4 py-3 font-semibold">
          {state.message}
        </p>
      ) : null}
      <div>
        <button type="submit" className={ACTION} disabled={pending}>
          {pending ? "Saving…" : "Subscribe"}
        </button>
      </div>
    </form>
  );
}
