"use client";
import { useEffect, useRef, useState } from "react";

type Phrase =
  | { type?: undefined; text: string }
  | { type: "correction"; original: string; correction: string };

const PHRASES: Phrase[] = [
  { text: 'Squaloo means "Do You"' },
  { text: "Print > Hello World, my name is Marshal" },
  { text: '"The secret impresses no one. The trick you use it for is EVERYTHING."' },
  {
    type: "correction",
    original: '"Move fast and break things"',
    correction: '> "Move fast and be responsible"',
  },
  { text: '"Dare to be naive" — R. Buckminster Fuller' },
  {
    text: '"You never change things by fighting the existing reality. To change something, build a new model that makes the existing model obsolete." — R. Buckminster Fuller',
  },
  { text: '"Dedication, hard work, plus patience." — Nipsey Hussle' },
  {
    text: '"Here\'s to the crazy ones... Because the ones who are crazy enough to think that they can change the world, are the ones who do." — Steve Jobs',
  },
  {
    text: '"A poet\'s mission is to make words do more work than they normally do, to make them work on more than one level." — Jay Z',
  },
  { text: '"The best time to call yourself a founder was yesterday…" — Marshal Aldoph' },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface DisplayState {
  primary: string;
  struck: boolean;
  secondary: string;
}

const TYPING_SPEED = 38;
const CLEARING_SPEED = 14;
const PAUSE_AFTER_TYPING = 2000;
const PAUSE_AFTER_STRIKE = 800;
const PAUSE_AFTER_CORRECTION = 2500;
const PAUSE_BETWEEN_PHRASES = 420;

export default function TerminalAnimation() {
  const [display, setDisplay] = useState<DisplayState>({
    primary: "",
    struck: false,
    secondary: "",
  });

  const queueRef = useRef<Phrase[]>(shuffle(PHRASES));
  const idxRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const wait = (ms: number) =>
      new Promise<void>((res) => setTimeout(res, ms));

    const runPhrase = async (phrase: Phrase) => {
      if (phrase.type === "correction") {
        // Type original
        for (let i = 0; i <= phrase.original.length; i++) {
          if (cancelled) return;
          setDisplay({ primary: phrase.original.slice(0, i), struck: false, secondary: "" });
          await wait(TYPING_SPEED);
        }
        await wait(600);

        // Apply strikethrough
        if (cancelled) return;
        setDisplay({ primary: phrase.original, struck: true, secondary: "" });
        await wait(PAUSE_AFTER_STRIKE);

        // Type correction
        for (let i = 0; i <= phrase.correction.length; i++) {
          if (cancelled) return;
          setDisplay({
            primary: phrase.original,
            struck: true,
            secondary: phrase.correction.slice(0, i),
          });
          await wait(TYPING_SPEED);
        }
        await wait(PAUSE_AFTER_CORRECTION);

        // Clear correction first
        for (let i = phrase.correction.length; i >= 0; i--) {
          if (cancelled) return;
          setDisplay({
            primary: phrase.original,
            struck: true,
            secondary: phrase.correction.slice(0, i),
          });
          await wait(CLEARING_SPEED);
        }
        // Clear struck original
        for (let i = phrase.original.length; i >= 0; i--) {
          if (cancelled) return;
          setDisplay({ primary: phrase.original.slice(0, i), struck: false, secondary: "" });
          await wait(CLEARING_SPEED);
        }
      } else {
        // Normal phrase
        for (let i = 0; i <= phrase.text.length; i++) {
          if (cancelled) return;
          setDisplay({ primary: phrase.text.slice(0, i), struck: false, secondary: "" });
          await wait(TYPING_SPEED);
        }
        await wait(PAUSE_AFTER_TYPING);

        for (let i = phrase.text.length; i >= 0; i--) {
          if (cancelled) return;
          setDisplay({ primary: phrase.text.slice(0, i), struck: false, secondary: "" });
          await wait(CLEARING_SPEED);
        }
      }
      await wait(PAUSE_BETWEEN_PHRASES);
    };

    const run = async () => {
      while (!cancelled) {
        const phrase = queueRef.current[idxRef.current % queueRef.current.length];
        idxRef.current++;
        if (idxRef.current % queueRef.current.length === 0) {
          queueRef.current = shuffle(PHRASES);
        }
        await runPhrase(phrase);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="font-mono bg-[#08090a] border border-neutral-800 w-full max-w-xl rounded-sm">
      {/* Terminal chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-neutral-800/70">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#63a375]/50" />
        <span className="ml-2 text-neutral-700 text-[9px] tracking-[0.25em] uppercase">
          squaloo — v2.1
        </span>
      </div>

      {/* Output */}
      <div className="px-3 py-3 flex items-start gap-2 min-h-[3.5rem]">
        <span className="text-[#1400bf] text-sm mt-px select-none leading-relaxed">❯</span>
        <div className="flex-1 text-[11px] sm:text-xs leading-relaxed break-words">
          <span
            className={
              display.struck
                ? "line-through text-neutral-600 decoration-[#1400bf]"
                : "text-[#f6f7eb]"
            }
          >
            {display.primary}
          </span>
          {display.secondary && (
            <span className="text-[#5688c7] ml-2">{display.secondary}</span>
          )}
          <span className="inline-block ml-[1px] w-[2px] h-[0.85em] bg-[#1400bf] align-middle animate-pulse" />
        </div>
      </div>
    </div>
  );
}
