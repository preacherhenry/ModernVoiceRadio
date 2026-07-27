"use client";

import { Signal, Timer, Users, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

export type StudioPhase = "OFFLINE" | "CONNECTING" | "LIVE";

const phaseMeta: Record<StudioPhase, { label: string; dot: string; text: string }> = {
  OFFLINE: { label: "Offline", dot: "bg-grey-600", text: "text-grey-400" },
  CONNECTING: { label: "Connecting…", dot: "bg-gold animate-pulse", text: "text-gold" },
  LIVE: { label: "Live", dot: "bg-red-bright animate-pulse-live", text: "text-red-bright" },
};

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function StatusHeader({
  phase,
  durationSeconds,
  listeners,
  bitrateKbps,
  connectionGood,
}: {
  phase: StudioPhase;
  durationSeconds: number;
  listeners: number | null;
  bitrateKbps: number | null;
  connectionGood: boolean;
}) {
  const meta = phaseMeta[phase];

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border border-line bg-ink-2 p-5">
      <div className="flex items-center gap-2.5">
        <span className={cn("size-2.5 rounded-full", meta.dot)} />
        <span className={cn("font-condensed text-sm font-bold uppercase tracking-[0.16em]", meta.text)}>
          {meta.label}
        </span>
      </div>

      <div className="flex items-center gap-2 text-grey-300">
        <Timer className="size-4 text-grey-500" />
        <span className="font-condensed text-sm font-semibold tabular-nums">
          {formatDuration(durationSeconds)}
        </span>
      </div>

      <div className="flex items-center gap-2 text-grey-300">
        <Users className="size-4 text-grey-500" />
        <span className="font-condensed text-sm font-semibold tabular-nums">
          {listeners === null ? "—" : listeners.toLocaleString()}
        </span>
        <span className="font-condensed text-xs uppercase tracking-[0.1em] text-grey-500">listeners</span>
      </div>

      <div className="flex items-center gap-2 text-grey-300">
        <Gauge className="size-4 text-grey-500" />
        <span className="font-condensed text-sm font-semibold tabular-nums">
          {bitrateKbps === null ? "—" : `${bitrateKbps} kbps`}
        </span>
      </div>

      <div
        className={cn(
          "ml-auto flex items-center gap-2 font-condensed text-xs font-semibold uppercase tracking-[0.1em]",
          phase === "LIVE" && connectionGood ? "text-emerald-400" : "text-grey-500"
        )}
      >
        <Signal className="size-4" />
        {phase !== "LIVE" ? "Standby" : connectionGood ? "Good Connection" : "Reconnecting…"}
      </div>
    </div>
  );
}
