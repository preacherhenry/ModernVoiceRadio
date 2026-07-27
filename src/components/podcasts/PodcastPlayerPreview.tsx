"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";

export default function PodcastPlayerPreview({ duration }: { duration: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="border border-line bg-ink-2 p-6 sm:p-7">
      <div className="flex items-center gap-5">
        <button
          onClick={() => setPlaying((v) => !v)}
          aria-label={playing ? "Pause preview" : "Play preview"}
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition-transform hover:scale-105 active:scale-95"
        >
          {playing ? (
            <Pause className="size-5 fill-current" />
          ) : (
            <Play className="size-5 translate-x-0.5 fill-current" />
          )}
        </button>
        <div className="flex flex-1 items-end gap-1" aria-hidden>
          {[8, 14, 20, 11, 24, 9, 17, 22, 12, 18, 10, 15, 21, 13, 9].map((h, i) => (
            <span
              key={i}
              className="w-full bg-grey-500/50"
              style={{
                height: h,
                animation: playing
                  ? `bar-bounce ${0.5 + (i % 4) * 0.1}s ease-in-out infinite`
                  : "none",
                opacity: playing ? 1 : 0.6,
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>
        <span className="shrink-0 font-condensed text-sm font-semibold text-grey-400">
          {duration}
        </span>
      </div>
      <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-grey-500">
        Preview player. Full episodes stream on the Modern Voice app, Apple
        Podcasts and Spotify.
      </p>
    </div>
  );
}
