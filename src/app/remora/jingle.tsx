"use client";

import { useEffect } from "react";

/**
 * The little jingle a new slot gets. Three notes from the browser's own oscillator,
 * played when the Vend form is submitted with an AUDIO quality. No audio file, no
 * third party, and nothing plays until the customer presses a button, so no browser
 * blocks it. Sound on by default, because fun.
 */
export default function Jingle({ formId }: { formId: string }) {
  useEffect(() => {
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) return;
    const onSubmit = () => {
      const q = (form.elements.namedItem("quality") as HTMLSelectElement | null)?.value ?? "";
      if (!q.startsWith("audio") && q !== "m4a") return;
      try {
        const Ctx = window.AudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
        notes.forEach((hz, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "square";
          o.frequency.value = hz;
          g.gain.value = 0.0001;
          o.connect(g).connect(ctx.destination);
          const t = ctx.currentTime + i * 0.09;
          g.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
          o.start(t);
          o.stop(t + 0.13);
        });
      } catch {
        // a browser without audio is a browser without a jingle; the vend still happens
      }
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [formId]);
  return null;
}
