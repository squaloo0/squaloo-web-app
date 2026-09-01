"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Replays the real Solomon demo as a terminal transcript, on loop.
 * The strike-through beat is the product thesis: the manual's official
 * answer gets overruled by the veteran's logged experience — with citations.
 */

type Step =
  | { kind: "line"; prefix: string; prefixClass: string; text: string; pause?: number }
  | { kind: "status"; text: string; pause?: number }
  | { kind: "strike"; prefix: string; prefixClass: string; wrong: string; right: string; cites: string[]; pause?: number };

const SCRIPT: Step[] = [
  {
    kind: "line",
    prefix: "ray@veteran-logbook",
    prefixClass: "text-[#5688c7]",
    text: "CB-400 — belt chatter near the drive pulley plus an E-207? It's never the VFD. Check the gearbox coupling shims first.",
    pause: 900,
  },
  {
    kind: "line",
    prefix: "solomon",
    prefixClass: "text-[#63a375]",
    text: "Logged — machine CB-400, error E-207. Indexed as a searchable entry; this will be cited when someone hits the same fault.",
    pause: 1400,
  },
  { kind: "status", text: "NETWORK: DISCONNECTED — SOLOMON: ONLINE", pause: 1300 },
  {
    kind: "line",
    prefix: "junior@equipment-line-1",
    prefixClass: "text-[#5688c7]",
    text: "Line 1 is down, VFD showing E-207 — what do I do?",
    pause: 900,
  },
  {
    kind: "strike",
    prefix: "solomon",
    prefixClass: "text-[#63a375]",
    wrong: "Manual §7.3: replace the VFD (6-hour teardown)…",
    right: "1. Lockout/Tagout first.  2. Inspect the gearbox coupling shims.  3. Replace with GC-2207-SHIM kit.",
    cites: ["Manual §7.3", "Log: Ray"],
    pause: 4200,
  },
];

const TYPE_MS = 26;
const LOOP_PAUSE = 2600;

interface Rendered {
  key: number;
  prefix?: string;
  prefixClass?: string;
  status?: boolean;
  text: string;
  struck?: string;
  cites?: string[];
}

export default function SolomonTranscript() {
  const [lines, setLines] = useState<Rendered[]>([]);
  const keyRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const typeInto = async (base: Rendered, text: string) => {
      for (let i = 1; i <= text.length; i++) {
        if (cancelled) return;
        setLines((prev) =>
          prev.map((l) => (l.key === base.key ? { ...l, text: text.slice(0, i) } : l))
        );
        await wait(TYPE_MS);
      }
    };

    const run = async () => {
      while (!cancelled) {
        setLines([]);
        for (const step of SCRIPT) {
          if (cancelled) return;
          const key = keyRef.current++;

          if (step.kind === "status") {
            setLines((prev) => [...prev, { key, status: true, text: step.text }]);
            await wait(step.pause ?? 800);
            continue;
          }

          const base: Rendered = {
            key,
            prefix: step.prefix,
            prefixClass: step.prefixClass,
            text: "",
          };
          setLines((prev) => [...prev, base]);

          if (step.kind === "line") {
            await typeInto(base, step.text);
            await wait(step.pause ?? 700);
          } else {
            // strike: type the wrong answer, strike it, type the right one + citations
            await typeInto(base, step.wrong);
            await wait(700);
            if (cancelled) return;
            setLines((prev) =>
              prev.map((l) => (l.key === key ? { ...l, struck: step.wrong, text: "" } : l))
            );
            await wait(500);
            await typeInto({ ...base, key }, step.right);
            if (cancelled) return;
            setLines((prev) =>
              prev.map((l) => (l.key === key ? { ...l, cites: step.cites } : l))
            );
            await wait(step.pause ?? 3000);
          }
        }
        await wait(LOOP_PAUSE);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="border border-neutral-800 bg-black/60 p-6 font-mono text-sm leading-relaxed min-h-[280px]">
      <div className="flex items-center gap-2 mb-4 text-[10px] tracking-[0.25em] uppercase text-neutral-600">
        <span className="w-2 h-2 rounded-full bg-[#63a375]" />
        live transcript — replayed from the august 2026 verification run
      </div>
      <div className="space-y-3">
        {lines.map((l) =>
          l.status ? (
            <div key={l.key} className="text-[11px] tracking-[0.2em] uppercase text-amber-500/80 border-y border-neutral-900 py-2">
              ⚠ {l.text}
            </div>
          ) : (
            <div key={l.key}>
              <span className={`${l.prefixClass} text-xs`}>{l.prefix}</span>
              <span className="text-neutral-600 text-xs"> $ </span>
              {l.struck && (
                <span className="text-neutral-500 line-through decoration-red-500/70">
                  {l.struck}
                </span>
              )}{" "}
              <span className="text-neutral-200">{l.text}</span>
              {l.text.length > 0 && <span className="text-[#5688c7] animate-pulse">▌</span>}
              {l.cites && (
                <span className="ml-2 inline-flex gap-2 align-middle">
                  {l.cites.map((c) => (
                    <span key={c} className="text-[10px] text-[#63a375] border border-[#63a375]/40 px-1.5 py-0.5">
                      {c}
                    </span>
                  ))}
                </span>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
