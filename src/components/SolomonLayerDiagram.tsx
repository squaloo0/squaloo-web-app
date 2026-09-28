"use client";

import { useEffect, useRef, useState } from "react";
import { brain, spine, bodies, ruler, fidelity, caption } from "@/data/solomon_layer";

/**
 * The Solomon Layer — public reduction (SQU-271 precision pass over SQU-263 v0).
 *
 * THE DIAGRAM'S ONE JOB is to show the flow: knowledge down into the bodies,
 * experience home. v0 shipped without connectors, so it drew a stack of boxes
 * and asserted a flow in prose. Both arrows are now drawn, and the pulse travels
 * ALONG them — motion that shows the thing, not motion as decoration. If the
 * pulse ever stops tracking the arrows it should be deleted, not tuned:
 * a decorative animation is a claim that shows nothing.
 *
 * GEOMETRY IS THE ARGUMENT. The ruler spans strata 2-3 exactly — top flush with
 * the spine, bottom flush with the bodies — and stops short of the brain. The
 * gap above it is the claim that verification never touches your custody. v0
 * overhung the band at both ends, which broke the span from the bottom while
 * preserving it at the top; both edges are now flush by construction.
 *
 * NO REFLOW: one viewBox scales uniformly, so the gutter, the gap and the
 * arrows survive to 375px and below. There is no breakpoint to get wrong.
 */

// ── Ruler band: sized from its longest label, never eyeballed ───────────────
// v0 clipped ("budgets, measurec", "published methodo…") because the band was a
// guessed constant. The band is now derived: wrap at a fixed character budget,
// then make the band wide enough for that budget at this font size.
const RULER_FS = 15;
const RULER_MAX_CHARS = 15;
const CHAR_W = 0.58; // conservative advance for the site's sans stack
const GUTTER_W = Math.ceil(RULER_MAX_CHARS * RULER_FS * CHAR_W) + 30;

function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (!line) line = word;
    else if ((line + " " + word).length <= max) line += " " + word;
    else { out.push(line); line = word; }
  }
  if (line) out.push(line);
  return out;
}

// ── Rhythm: consistent box heights per row, equal gaps sized to hold an arrow ─
const W = 760;
const PAD = 16;
const GAP = 72;

const BRAIN_Y = 12, BRAIN_H = 96;
const SPINE_Y = BRAIN_Y + BRAIN_H + GAP, SPINE_H = 76;
const BODIES_Y = SPINE_Y + SPINE_H + GAP, BODIES_H = 110;
const H = BODIES_Y + BODIES_H + 14;

const GUTTER_X = W - PAD - GUTTER_W;
const STACK_W = GUTTER_X - PAD - 18;

// The band spans strata 2-3 and ONLY strata 2-3.
const RULER_TOP = SPINE_Y;
const RULER_BOTTOM = BODIES_Y + BODIES_H;

const CX = PAD + STACK_W / 2;
const DOWN_X = CX - 62;
const HOME_X = CX + 62;

const BLUE = "#5688c7";
const GREEN = "#63a375";
const AMBER = "#d98c5f";
const LINE = "#404040";
const DIM = "#a3a3a3";

export default function SolomonLayerDiagram() {
  const [revealed, setRevealed] = useState(false);
  const [run, setRun] = useState(false);
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (e) => { if (e.some((x) => x.isIntersecting)) { setRun(true); io.disconnect(); } },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const bodyW = (STACK_W - 2 * 12) / 3;
  const travel = BODIES_Y - (BRAIN_Y + BRAIN_H); // exact arrow span, both ways

  return (
    <div>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto"
           role="img" aria-labelledby="sl-title sl-desc">
        <title id="sl-title">The Solomon Layer</title>
        <desc id="sl-desc">
          Your brain holds the knowledge and never answers. One sync carries knowledge down into the
          bodies and carries experience home; that link is severable. Three bodies answer offline
          under the same contract. A ruler spanning the sync and the bodies measures them, and does
          not reach the brain.
        </desc>

        <defs>
          <marker id="sl-ah-down" viewBox="0 0 10 10" refX="8" refY="5"
                  markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={BLUE} />
          </marker>
          <marker id="sl-ah-home" viewBox="0 0 10 10" refX="8" refY="5"
                  markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={GREEN} />
          </marker>
        </defs>

        <style>{`
          .sl-p { opacity: 0; }
          .sl-run .sl-down { animation: sl-d 2.4s cubic-bezier(.4,0,.5,1) .15s 1 forwards; }
          .sl-run .sl-home { animation: sl-h 1.9s cubic-bezier(.4,0,.5,1) 2.7s 1 forwards; }
          @keyframes sl-d {
            0%{opacity:0;transform:translateY(0)} 10%{opacity:1}
            85%{opacity:1} 100%{opacity:0;transform:translateY(${travel}px)}
          }
          @keyframes sl-h {
            0%{opacity:0;transform:translateY(0)} 12%{opacity:.85}
            85%{opacity:.85} 100%{opacity:0;transform:translateY(-${travel}px)}
          }
          @media (prefers-reduced-motion: reduce) {
            .sl-run .sl-down, .sl-run .sl-home { animation: none; opacity: 0; }
          }
        `}</style>

        <g className={run ? "sl-run" : undefined}>
          {/* ── Stratum 1 · custody. Above the ruler's reach. ── */}
          <rect x={PAD} y={BRAIN_Y} width={STACK_W} height={BRAIN_H} rx="3"
                fill="rgba(86,136,199,0.10)" stroke={BLUE} strokeWidth="1.5" />
          <text x={PAD + 20} y={BRAIN_Y + 40} fill="#fff" fontSize="23" fontWeight="600">{brain.title}</text>
          <text x={PAD + 20} y={BRAIN_Y + 70} fill={DIM} fontSize="18">{brain.note}</text>

          {/* ── Connectors: the flow, drawn. Two channels, both gaps. ── */}
          {[[BRAIN_Y + BRAIN_H, SPINE_Y], [SPINE_Y + SPINE_H, BODIES_Y]].map(([y1, y2], i) => (
            <g key={i}>
              <line x1={DOWN_X} y1={y1 + 8} x2={DOWN_X} y2={y2 - 8}
                    stroke={BLUE} strokeWidth="2" markerEnd="url(#sl-ah-down)" />
              <line x1={HOME_X} y1={y2 - 8} x2={HOME_X} y2={y1 + 8}
                    stroke={GREEN} strokeWidth="1.6" markerEnd="url(#sl-ah-home)" />
            </g>
          ))}
          <text x={DOWN_X - 12} y={BRAIN_Y + BRAIN_H + 22} fill={BLUE} fontSize="14" textAnchor="end">knowledge down</text>
          <text x={HOME_X + 12} y={BRAIN_Y + BRAIN_H + 22} fill={GREEN} fontSize="14">experience home</text>

          {/* The severability cut — deliberate and labelled, across the link it cuts.
              v0 left an unlabelled dashed fragment floating near the ruler, which
              read as debris. It is a claim, so it is drawn as one. */}
          <line x1={DOWN_X - 34} y1={SPINE_Y - 16} x2={HOME_X + 34} y2={SPINE_Y - 16}
                stroke={DIM} strokeWidth="1" strokeDasharray="5 5" />
          <text x={HOME_X + 42} y={SPINE_Y - 11} fill={DIM} fontSize="13">severable</text>

          {/* ── Stratum 2 · the sync ── */}
          <rect x={PAD} y={SPINE_Y} width={STACK_W} height={SPINE_H} rx="3"
                fill="rgba(255,255,255,0.05)" stroke={LINE} strokeWidth="1.5" />
          <text x={PAD + 20} y={SPINE_Y + 32} fill="#fff" fontSize="20" fontWeight="600">{spine.title}</text>
          <text x={PAD + 20} y={SPINE_Y + 58} fill={DIM} fontSize="17">{spine.note}</text>

          {/* The pulse rides the arrows it is explaining. */}
          <circle className="sl-p sl-down" cx={DOWN_X} cy={BRAIN_Y + BRAIN_H + 6} r="5.5" fill={BLUE} />
          <circle className="sl-p sl-home" cx={HOME_X} cy={BODIES_Y - 6} r="4" fill={GREEN} />

          {/* ── Stratum 3 · compute ── */}
          {bodies.map((b, i) => {
            const x = PAD + i * (bodyW + 12);
            return (
              <g key={b.name}>
                <rect x={x} y={BODIES_Y} width={bodyW} height={BODIES_H} rx="3"
                      fill="rgba(99,163,117,0.10)" stroke={GREEN} strokeWidth="1.5" />
                <text x={x + 16} y={BODIES_Y + 42} fill="#fff" fontSize="19" fontWeight="600">{b.name}</text>
                <text x={x + 16} y={BODIES_Y + 70} fill={DIM} fontSize="16">{b.note}</text>
              </g>
            );
          })}

          {/* ── The ruler: flush to the spine's top and the bodies' bottom ── */}
          <rect x={GUTTER_X} y={RULER_TOP} width={GUTTER_W} height={RULER_BOTTOM - RULER_TOP} rx="3"
                fill="rgba(217,140,95,0.09)" stroke={AMBER} strokeWidth="1.5" />
          <text x={GUTTER_X + 15} y={RULER_TOP + 30} fill={AMBER} fontSize="19" fontWeight="600">{ruler.title}</text>
          {(() => {
            let ln = 0;
            return ruler.items.map((it) => (
              <g key={it}>
                {wrap(it, RULER_MAX_CHARS).map((l) => (
                  <text key={l} x={GUTTER_X + 15} y={RULER_TOP + 62 + ln++ * 21} fill={DIM} fontSize={RULER_FS}>{l}</text>
                ))}
              </g>
            ));
          })()}
        </g>
      </svg>

      {/* Sits under the ruler column, because that is what the arrow points at.
          Left-aligned it pointed at the bodies and said the opposite thing. */}
      <p className="text-xs font-mono tracking-wider mt-3 text-right" style={{ color: AMBER }}>
        {ruler.microLabel} ↑
      </p>
      <p className="text-neutral-400 text-sm mt-6 text-center">{caption}</p>

      <div className="text-center">
      <button type="button" onClick={() => setRevealed((v) => !v)} aria-expanded={revealed}
        className="mt-5 text-xs font-mono tracking-widest uppercase text-neutral-500 border-b border-dotted border-neutral-600 hover:text-white hover:border-white transition-colors">
        {fidelity.affordance} {revealed ? "−" : "+"}
      </button>
      {revealed ? (
        <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl mx-auto mt-4 text-left pl-4 border-l-2 border-neutral-700">
          {fidelity.body}
        </p>
      ) : null}
      </div>
    </div>
  );
}
