"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Loader2, Volume2, VolumeX, Users } from "lucide-react";
import { usePlayer } from "./PlayerProvider";
import { station } from "@/data/station";
import { cn } from "@/lib/utils";

export default function PlayerBar() {
  const {
    isPlaying,
    isLoading,
    togglePlay,
    volume,
    muted,
    setVolume,
    toggleMute,
    listeners,
    streamOnline,
    nowPlaying,
  } = usePlayer();

  const trackKey = nowPlaying ? `${nowPlaying.song}::${nowPlaying.artist}` : "loading";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-ink-2/97 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-20 sm:gap-5 sm:px-8 lg:px-10">
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause live stream" : "Play live stream"}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red text-white transition-colors hover:bg-red-dark sm:size-14"
        >
          {isLoading ? (
            <Loader2 className="size-5 animate-spin sm:size-6" />
          ) : isPlaying ? (
            <Pause className="size-5 fill-current sm:size-6" />
          ) : (
            <Play className="size-5 translate-x-0.5 fill-current sm:size-6" />
          )}
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div className="hidden shrink-0 items-center gap-1.5 border-r border-line pr-4 sm:flex">
            {streamOnline === false ? (
              <>
                <span className="inline-flex size-2 rounded-full bg-grey-500" />
                <span className="font-condensed text-xs font-bold uppercase tracking-[0.16em] text-grey-500">
                  Offline
                </span>
              </>
            ) : (
              <>
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full rounded-full bg-red animate-pulse-live" />
                  <span className="relative inline-flex size-2 rounded-full bg-red" />
                </span>
                <span className="font-condensed text-xs font-bold uppercase tracking-[0.16em] text-red">
                  Live
                </span>
              </>
            )}
          </div>

          <div className="min-w-0">
            <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.16em] text-grey-400">
              {station.frequency} · Now Playing
            </p>
            <AnimatePresence mode="wait" initial={false}>
              {nowPlaying ? (
                <motion.p
                  key={trackKey}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="truncate text-sm font-semibold text-white sm:text-base"
                >
                  {nowPlaying.song}
                  <span className="text-grey-400"> — {nowPlaying.artist}</span>
                </motion.p>
              ) : (
                <span className="mt-1 block h-4 w-40 animate-pulse bg-ink-4" />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden items-center gap-2 border-l border-line pl-5 text-grey-300 md:flex">
          <Users className="size-4" />
          {listeners === null ? (
            <span className="font-condensed text-xs uppercase tracking-[0.1em] text-grey-500">
              Listeners unavailable
            </span>
          ) : (
            <>
              <span className="font-condensed text-sm font-semibold tabular-nums">
                {listeners.toLocaleString()}
              </span>
              <span className="font-condensed text-xs uppercase tracking-[0.1em] text-grey-500">
                listening
              </span>
            </>
          )}
        </div>

        <div className="hidden items-center gap-2 pl-5 lg:flex">
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="text-grey-300 hover:text-white"
          >
            {muted || volume === 0 ? (
              <VolumeX className="size-5" />
            ) : (
              <Volume2 className="size-5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className={cn(
              "h-1 w-24 cursor-pointer appearance-none bg-ink-4 accent-gold",
            )}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
