"use client";

import { useState } from "react";

type Checked = {
  ok: boolean;
  signature: { ok: boolean; keyId?: string; reason?: string };
  vended: { at: string; job: string; bytes: number } | null;
  receipt: { title: string; sha256: string; bytes: number; vendedAt: string; source: string; card: string | null; machine: string | null };
  paper: string[];
};
type Result = { kind: "bad"; reason: string } | { kind: "checked"; r: Checked };

/** Paste a receipt, get a verdict. Talks only to this origin. */
export default function VerifyForm() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);

  async function check() {
    setBusy(true);
    try {
      const res = await fetch("/api/remora/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ receipt: text }) });
      const json = (await res.json()) as Checked | { ok: false; reason: string };
      setResult("signature" in json ? { kind: "checked", r: json } : { kind: "bad", reason: json.reason });
    } catch {
      setResult({ kind: "bad", reason: "could not reach the machine" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        rows={10}
        placeholder='{ "receipt": { "version": 1, ... } }  — paste the whole .receipt.json'
        className="w-full bg-black border border-neutral-800 px-3 py-2 text-xs text-white placeholder:text-neutral-700 focus:outline-none focus:border-[#5688c7]"
      />
      <button
        type="button"
        onClick={check}
        disabled={busy || text.trim().length === 0}
        className="self-start px-4 py-2 text-xs tracking-[0.2em] uppercase border border-[#1400bf] bg-[#1400bf] text-white hover:bg-[#5688c7] hover:border-[#5688c7] transition-colors disabled:opacity-40"
      >
        {busy ? "Checking" : "Check"}
      </button>

      {result === null ? null : result.kind === "bad" ? (
        <Verdict tone="red" head="Not a receipt" text={result.reason} />
      ) : (
        <div className="flex flex-col gap-4">
          <Verdict
            tone={result.r.ok ? "green" : "red"}
            head={result.r.ok ? "Signature valid" : "Signature not valid"}
            text={result.r.ok ? `signed by key ${result.r.signature.keyId}` : (result.r.signature.reason ?? "")}
          />
          <Verdict
            tone={result.r.vended ? "green" : "dim"}
            head={result.r.vended ? "The machine remembers these bytes" : "No record of these bytes"}
            text={
              result.r.vended
                ? `job ${result.r.vended.job} · ${result.r.vended.bytes} B · shelved ${result.r.vended.at.replace("T", " ").slice(0, 19)} UTC`
                : "either it never dropped here, or the shelf record has aged out; the signature stands on its own"
            }
          />
          <pre className="text-[11px] leading-snug text-neutral-400 bg-black border border-neutral-800 p-4 overflow-x-auto">{result.r.paper.join("\n")}</pre>
        </div>
      )}
    </div>
  );
}

function Verdict({ tone, head, text }: { tone: "green" | "red" | "dim"; head: string; text: string }) {
  const color = tone === "green" ? "border-[#63a375] text-[#63a375]" : tone === "red" ? "border-red-900 text-red-400" : "border-neutral-800 text-neutral-500";
  return (
    <div className={`border px-4 py-3 ${color}`}>
      <div className="text-[10px] tracking-[0.3em] uppercase">{head}</div>
      <div className="text-xs text-neutral-400 mt-1 break-all">{text}</div>
    </div>
  );
}
