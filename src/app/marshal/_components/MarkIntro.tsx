"use client";

/**
 * The first-load intro (SQU-461). The full figure sits centred over the page on
 * a paper veil, then travels and scales to the header slot (`[data-mark-slot]`)
 * while the lattice and the outer ring fade out and the inner ring fades in.
 *
 * - Once per browser session (sessionStorage `marshal-intro`), set at start so a
 *   reload mid-animation doesn't replay.
 * - Skipped under prefers-reduced-motion (the inline script in page.tsx never
 *   sets `data-marshal-intro`, and marshal.css hides the overlay).
 * - Fails open: if this component never hydrates or the animation errors, a CSS
 *   animation (`mk-bail` / `mk-unbail`) removes the overlay and reveals the
 *   header slot after four seconds. The page is readable underneath throughout:
 *   the overlay has pointer-events: none, and the veil is translucent.
 * - CSS + Web Animations API only; no animation library.
 */
import { useEffect, useRef } from "react";
import Mark from "./Mark";

/** viewBox width of the full figure over the compact mark's (620 / 480). */
const FULL_OVER_COMPACT = 620 / 480;

export default function MarkIntro() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = ref.current;
    const root = overlay?.closest<HTMLElement>(".mk-root");
    if (!overlay || !root || root.dataset.marshalIntro !== "1") return;

    const fig = overlay.querySelector<HTMLElement>(".mk-intro-fig");
    const slot = root.querySelector<HTMLElement>("[data-mark-slot]");
    const done = () => {
      if (!cancelled) delete root.dataset.marshalIntro;
    };
    let cancelled = false;
    try {
      sessionStorage.setItem("marshal-intro", "1");
    } catch {
      /* private mode: the intro may replay next visit; harmless */
    }
    if (!fig || !slot || performance.now() > 3500) {
      done();
      return;
    }

    const from = fig.getBoundingClientRect();
    const to = slot.getBoundingClientRect();
    const k = (to.width * FULL_OVER_COMPACT) / from.width;
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);

    const anims: Animation[] = [];
    const run = (el: Element | null, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
      if (el) anims.push(el.animate(frames, opts));
    };

    run(fig, [{ transform: "translate(0, 0) scale(1)" }, { transform: `translate(${dx}px, ${dy}px) scale(${k})` }], {
      duration: 900,
      delay: 450,
      easing: "cubic-bezier(0.65, 0, 0.2, 1)",
      fill: "forwards",
    });
    run(overlay.querySelector(".mk-intro-veil"), [{ opacity: 1 }, { opacity: 0 }], {
      duration: 700,
      delay: 450,
      easing: "ease-out",
      fill: "forwards",
    });
    for (const sel of [".mk-lattice", ".mk-ring-outer"]) {
      run(fig.querySelector(sel), [{ opacity: 1 }, { opacity: 0 }], {
        duration: 600,
        delay: 450,
        easing: "ease-out",
        fill: "forwards",
      });
    }
    run(fig.querySelector(".mk-ring-inner"), [{ opacity: 0 }, { opacity: 1 }], {
      duration: 500,
      delay: 850,
      easing: "ease-in",
      fill: "forwards",
    });

    anims[0]?.finished.then(
      () => { if (!cancelled) done(); },
      () => { if (!cancelled) done(); },
    );
    return () => {
      cancelled = true;
      anims.forEach((a) => a.cancel());
    };
  }, []);

  return (
    <div ref={ref} className="mk-intro" aria-hidden="true">
      <div className="mk-intro-veil" />
      <div className="mk-intro-fig">
        <Mark variant="full" decorative />
      </div>
    </div>
  );
}
