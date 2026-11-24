"use client";

/**
 * The media frame of a timeline entry: one image, a small gallery, or a video
 * with a poster. Prev/next buttons are 44px targets; the left and right arrow
 * keys work while the frame has focus. No carousel library.
 *
 * Only the current image is rendered, so a nine-image gallery costs one
 * request until someone pages through it. Video uses preload="none": nothing
 * but the poster loads until play.
 */
import { useCallback, useRef, useState, type KeyboardEvent } from "react";
import CldImage from "./CldImage";
import { posterUrl, videoUrl } from "../_lib/cloudinary";
import type { MediaRecord } from "../_data/media";

type Props = {
  items: readonly MediaRecord[];
  label: string;
  /** Start on this item (the "View plays the video" entries). */
  index: number;
  onIndex: (i: number) => void;
  /** The first entry's lead is above the fold on most screens. */
  priority?: boolean;
  /** Set when View asked for playback, so the video starts on mount. */
  autoPlay?: boolean;
};

const BUTTON =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-sq-rule bg-sq-ground text-sq-ink hover:border-solomon-blue hover:text-solomon-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solomon-blue disabled:opacity-40";

export default function MediaFrame({ items, label, index, onIndex, priority = false, autoPlay = false }: Props) {
  const count = items.length;
  const item = items[Math.min(index, count - 1)];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const go = useCallback(
    (delta: number) => {
      onIndex((index + delta + count) % count);
    },
    [index, count, onIndex],
  );

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (count < 2) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  if (!item) return null;
  const portrait = item.height > item.width * 1.05;

  return (
    <div
      className="flex flex-col gap-3"
      role="group"
      aria-roledescription={count > 1 ? "carousel" : undefined}
      aria-label={label}
      tabIndex={count > 1 ? 0 : undefined}
      onKeyDown={onKey}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sq-md border border-sq-rule bg-sq-card md:aspect-[3/2]">
        {item.kind === "video" ? (
          <video
            key={item.id}
            ref={videoRef}
            className="absolute inset-0 h-full w-full bg-sq-ground-ink object-contain"
            controls
            playsInline
            preload="none"
            autoPlay={autoPlay}
            poster={posterUrl(item)}
            aria-label={item.alt}
          >
            <source src={videoUrl(item.id)} type="video/mp4" />
          </video>
        ) : failed[item.id] ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-sq-label">
            Image unavailable
          </div>
        ) : (
          <CldImage
            key={item.id}
            src={item.id}
            alt={item.alt}
            fill
            sizes="(min-width: 1024px) 660px, (min-width: 640px) 90vw, 100vw"
            className={portrait ? "object-contain" : "object-contain"}
            priority={priority && index === 0}
            onError={() => setFailed((f) => ({ ...f, [item.id]: true }))}
          />
        )}
      </div>

      {count > 1 && (
        <div className="flex items-center justify-between gap-3">
          <button type="button" className={BUTTON} onClick={() => go(-1)} aria-label="Previous image">
            <span aria-hidden="true">←</span>
          </button>
          <span className="font-mono text-[12px] tracking-[0.14em] text-sq-label" aria-live="polite">
            {Math.min(index, count - 1) + 1} / {count}
          </span>
          <button type="button" className={BUTTON} onClick={() => go(1)} aria-label="Next image">
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
