"use client";

import { useState } from "react";

type Props = {
  /** YouTube video id. */
  id: string;
  /** Accessible title, also shown under the frame. */
  title: string;
  /** Local poster path. Kept in /public deliberately — see note below. */
  poster: string;
  /** Optional short caption rendered under the frame. */
  caption?: string;
};

/**
 * Click-to-play YouTube facade.
 *
 * Nothing is requested from YouTube until the viewer presses play: the poster is
 * served from our own origin and the iframe is only mounted on click. That keeps
 * a page arguing for data sovereignty from quietly loading third-party player
 * code on arrival, and it keeps the third-party payload off the initial render.
 *
 * The embed uses youtube-nocookie.com, which defers YouTube's cookies until
 * playback actually starts.
 */
export default function VideoEmbed({ id, title, poster, caption }: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <figure className="m-0">
      <div className="relative w-full aspect-video border border-neutral-800 bg-black overflow-hidden">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${title}`}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            {/*
              Plain <img>: the poster is a fixed local asset and next/image would
              add a loader for no benefit here. object-cover on a 16:9 box crops
              exactly the letterbox bars YouTube bakes into its 4:3 thumbnail.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-200 group-hover:opacity-90"
            />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1400bf] transition-colors duration-200 group-hover:bg-[#5688c7]">
                {/* Play triangle */}
                <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-white" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-300">
                Play — 60 seconds
              </span>
            </span>
          </button>
        )}
      </div>
      {caption ? (
        <figcaption className="mt-3 font-mono text-xs leading-relaxed text-neutral-600">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
