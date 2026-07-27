"use client";

import { Pause, Play } from "lucide-react";
import { usePlayer } from "./PlayerProvider";
import { cn } from "@/lib/utils";

export default function ListenLiveButton({ className }: { className?: string }) {
  const { isPlaying, togglePlay } = usePlayer();

  return (
    <button
      onClick={togglePlay}
      className={cn(
        "inline-flex items-center justify-center gap-2.5 bg-red px-6 py-3.5 font-condensed text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:bg-red-dark",
        className
      )}
    >
      {isPlaying ? (
        <Pause className="size-4 fill-current" />
      ) : (
        <Play className="size-4 fill-current" />
      )}
      {isPlaying ? "Now Playing" : "Listen Live"}
    </button>
  );
}
