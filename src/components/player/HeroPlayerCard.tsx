"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Pause, Play, Users, Volume2, VolumeX } from "lucide-react";
import { usePlayer } from "./PlayerProvider";
import { station } from "@/data/station";
import Logo from "@/components/ui/Logo";

export default function HeroPlayerCard() {
  const {
    isPlaying,
    isLoading,
    togglePlay,
    volume,
    muted,
    setVolume,
    toggleMute,
    listeners,
    bitrateKbps,
    artworkUrl,
    streamOnline,
    nowPlaying,
  } = usePlayer();

  const trackKey = nowPlaying ? `${nowPlaying.song}::${nowPlaying.artist}` : "loading";

  return (
    <div className="w-full max-w-md border border-line-strong bg-ink-2/90 p-6 backdrop-blur-sm sm:p-7">
      <div className="flex items-center justify-between">
        <Logo markOnly />
        <div className="flex items-center gap-1.5">
          {streamOnline === false ? (
            <>
              <span className="inline-flex size-2 rounded-full bg-grey-500" />
              <span className="font-condensed text-xs font-bold uppercase tracking-[0.18em] text-grey-500">
                Offline
              </span>
            </>
          ) : (
            <>
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-red animate-pulse-live" />
                <span className="relative inline-flex size-2 rounded-full bg-red" />
              </span>
              <span className="font-condensed text-xs font-bold uppercase tracking-[0.18em] text-red">
                Live on Air
              </span>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-end gap-1" aria-hidden>
        {[10, 18, 9, 22, 14, 24, 11, 19, 8, 16, 20, 12].map((h, i) => (
          <span
            key={i}
            className="w-full bg-gold/80"
            style={{
              height: h,
              animation: isPlaying
                ? `bar-bounce ${0.6 + (i % 5) * 0.12}s ease-in-out infinite`
                : "none",
              opacity: isPlaying ? 1 : 0.25,
              transformOrigin: "bottom",
            }}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="relative size-14 shrink-0 overflow-hidden border border-line-strong bg-ink">
          {artworkUrl ? (
            <Image src={artworkUrl} alt="" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Logo markOnly />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-condensed text-xs font-semibold uppercase tracking-[0.2em] text-grey-400">
            Now Playing
          </p>
          <AnimatePresence mode="wait" initial={false}>
            {nowPlaying ? (
              <motion.div
                key={trackKey}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <p className="mt-1 truncate text-xl font-bold text-white">{nowPlaying.song}</p>
                <p className="truncate text-sm text-grey-300">{nowPlaying.artist}</p>
              </motion.div>
            ) : (
              <div className="mt-1 flex flex-col gap-2">
                <span className="h-5 w-40 animate-pulse bg-ink-4" />
                <span className="h-4 w-28 animate-pulse bg-ink-4" />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause live stream" : "Play live stream"}
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-red text-white transition-transform hover:scale-105 hover:bg-red-dark active:scale-95"
        >
          {isLoading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : isPlaying ? (
            <Pause className="size-6 fill-current" />
          ) : (
            <Play className="size-6 translate-x-0.5 fill-current" />
          )}
        </button>

        <div className="flex flex-1 items-center gap-2.5">
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
            className="h-1 w-full cursor-pointer appearance-none bg-ink-4 accent-gold"
            aria-label="Volume"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <div className="flex items-center gap-2 text-grey-300">
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
                listening now
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {bitrateKbps !== null && (
            <span className="font-condensed text-xs font-semibold uppercase tracking-[0.1em] text-grey-500">
              {bitrateKbps} kbps
            </span>
          )}
          <span className="font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-gold">
            {station.frequency}
          </span>
        </div>
      </div>
    </div>
  );
}
