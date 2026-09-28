"use client";

import { useEffect, useRef, useState } from "react";
import { brain, spine, bodies, ruler, fidelity, caption } from "@/data/solomon_layer";

/**
 * The Solomon Layer — public reduction (SQU-263 v0).
 *
 * GEOMETRY IS THE ARGUMENT
 * ------------------------
 * The ruler spans the spine and the bodies and stops short of the brain. That
 * gap is not decoration: it is the claim that verification never touches your
 * custody, drawn rather than asserted.
 *
 * The brief's original mobile fallback dropped the ruler below the bodies as a
 * horizontal strip. Stacked that way it reads as SEQUENCE ("and then, the
 * ruler") rather than EXCLUSION, which loses the one property the reduction is
 * required to keep — in the layout a stranger is most likely to see.
 *
 * Resolution (founder-ratified): the ruler stays visually bound to the spine and
 * bodies at EVERY width. This is done by not reflowing at all — one viewBox that
 * scales uniformly, so the gutter and the gap survive by construction down to
 * 375px and below. There is no breakpoint to get wrong because there is no
 * breakpoint.
 *
 * The micro-label under the ruler is NOT a narrow-width fallback; it renders
 * always. Geometry carries the claim and so do words, so the argument survives
 * a screenshot, a low-vision reader, and a scaled-down render equally.
 */

const W = 760;
const H = 470;

// Columns: the stack occupies the left; the ruler owns a narrow right gutter.
const PAD = 16;
const GUTTER_W = 128;
const GUTTER_X = W - PAD - GUTTER_W;
const STACK_W = GUTTER_X - PAD * 2;

// Rows. BRAIN_BOTTOM -> RULER_TOP is the gap the ruler must never cross.
const BRAIN_Y = 10;
const BRAIN_H = 92;
const SPINE_Y = 150;
const SPINE_H = 68;
const BODIES_Y = 258;
const BODIES_H = 112;

const RULER_TOP = SPINE_Y - 14;
const RULER_BOTTOM = BODIES_Y + BODIES_H + 14;

const BLUE = "#5688c7";
const GREEN = "#63a375";
const AMBER = "#d98c5f";
const LINE = "#404040";
const DIM = "#a3a3a3";

export default function SolomonLayerDiagram() {
  const [revealed, setRevealed] = useState(false);
  const [run, setRun] = useState(false);
  const ref = useRef<SVGSVGElement | null>(null);

  // Pulse ONCE when the diagram scrolls into view, then rest. A perpetual loop
  // adds no information after its first cycle and competes for attention during
  // a live demo. Replay is available on demand via the button below.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const bodyW = (STACK_W - 2 * 12) / 3;

  return (
    <div>
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-labelledby="sl-title sl-desc"
      >
        <title id="sl-title">The Solomon Layer</title>
        <desc id="sl-desc">
          Your brain holds the knowledge and never answers. One sync carries knowledge down to the
          bodies and experience home. Three bodies answer offline under the same contract. A ruler
          alongside measures the bodies and the sync, and does not reach the brain.
        </desc>

        <style>{`
          .sl-pulse { opacity: 0; }
          .sl-run .sl-pulse { animation: sl-travel 2.6s ease-in-out 1 forwards; }
          .sl-run .sl-pulse-back { animation: sl-return 1.6s ease-in-out 2.6s 1 forwards; }
          @keyframes sl-travel {
            0%   { opacity: 0; transform: translateY(-46px); }
            12%  { opacity: 1; }
            88%  { opacity: 1; }
            100% { opacity: 0; transform: translateY(150px); }
          }
          @keyframes sl-return {
            0%   { opacity: 0; transform: translateY(150px); }
            15%  { opacity: .7; }
            85%  { opacity: .7; }
            100% { opacity: 0; transform: translateY(-46px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .sl-run .sl-pulse, .sl-run .sl-pulse-back { animation: none; opacity: 0; }
          }
        `}</style>

        <g className={run ? "sl-run" : undefined}>
          {/* ── Stratum 1 · custody. Above the ruler's reach. ── */}
          <rect x={PAD} y={BRAIN_Y} width={STACK_W} height={BRAIN_H} rx="2"
                fill="rgba(86,136,199,0.07)" stroke={BLUE} strokeWidth="1.5" />
          <text x={PAD + 18} y={BRAIN_Y + 38} fill="#fff" fontSize="23" fontWeight="600">{brain.title}</text>
          <text x={PAD + 18} y={BRAIN_Y + 68} fill={DIM} fontSize="18">{brain.note}</text>

          {/* ── Stratum 2 · the sync ── */}
          <rect x={PAD} y={SPINE_Y} width={STACK_W} height={SPINE_H} rx="2"
                fill="rgba(255,255,255,0.03)" stroke={LINE} strokeWidth="1.5" />
          <text x={PAD + 18} y={SPINE_Y + 28} fill="#fff" fontSize="20" fontWeight="600">{spine.title}</text>
          <text x={PAD + 18} y={SPINE_Y + 52} fill={DIM} fontSize="17">{spine.note}</text>

          {/* the travelling pulse — one trip down, a smaller one home */}
          <g>
            <circle className="sl-pulse" cx={PAD + STACK_W / 2} cy={SPINE_Y + 34} r="5" fill={BLUE} />
            <circle className="sl-pulse-back" cx={PAD + STACK_W / 2 + 22} cy={SPINE_Y + 34} r="3.5" fill={GREEN} />
          </g>

          {/* ── Stratum 3 · compute. Same anatomy on each: learn it once. ── */}
          {bodies.map((b, i) => {
            const x = PAD + i * (bodyW + 12);
            return (
              <g key={b.name}>
                <rect x={x} y={BODIES_Y} width={bodyW} height={BODIES_H} rx="2"
                      fill="rgba(99,163,117,0.07)" stroke={GREEN} strokeWidth="1.5" />
                <text x={x + 14} y={BODIES_Y + 40} fill="#fff" fontSize="19" fontWeight="600">{b.name}</text>
                <text x={x + 14} y={BODIES_Y + 68} fill={DIM} fontSize="16">{b.note}</text>
              </g>
            );
          })}

          {/* ── The ruler. Starts BELOW the brain and stops at the bodies. ── */}
          <rect x={GUTTER_X} y={RULER_TOP} width={GUTTER_W} height={RULER_BOTTOM - RULER_TOP} rx="2"
                fill="rgba(217,140,95,0.06)" stroke={AMBER} strokeWidth="1.5" />
          <text x={GUTTER_X + 14} y={RULER_TOP + 30} fill={AMBER} fontSize="19" fontWeight="600">{ruler.title}</text>
          {ruler.items.map((it, i) => (
            <text key={it} x={GUTTER_X + 14} y={RULER_TOP + 62 + i * 26} fill={DIM} fontSize="15">
              {it}
            </text>
          ))}

          {/* The gap made explicit: a dashed ceiling the ruler visibly stops under. */}
          <line x1={GUTTER_X} y1={RULER_TOP - 12} x2={W - PAD} y2={RULER_TOP - 12}
                stroke={LINE} strokeWidth="1" strokeDasharray="3 4" />
        </g>
      </svg>

      {/* Micro-label: renders ALWAYS, not only when narrow. The claim survives
          in words as well as geometry — screenshot, scaled render, or screen reader. */}
      <p className="text-xs font-mono tracking-wider mt-3" style={{ color: AMBER }}>
        ↑ {ruler.microLabel}
      </p>

      <p className="text-neutral-400 text-sm mt-5">{caption}</p>

      {/* Progressive disclosure. A real <button>, so it is keyboard-reachable and
          visibly present — a hover-only secret would be indistinguishable from
          an absent claim. Nothing above depends on it being opened. */}
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        aria-expanded={revealed}
        className="mt-6 text-xs font-mono tracking-widest uppercase text-neutral-500 border-b border-dotted border-neutral-600 hover:text-white hover:border-white transition-colors"
      >
        {fidelity.affordance} {revealed ? "−" : "+"}
      </button>
      {revealed ? (
        <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl mt-4 pl-4 border-l-2 border-neutral-700">
          {fidelity.body}
        </p>
      ) : null}
    </div>
  );
}
