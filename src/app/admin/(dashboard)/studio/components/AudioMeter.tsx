"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { MeterReading } from "@/hooks/useBroadcastAudio";

function levelToPercent(value: number) {
  if (value <= 0.00001) return 0;
  const db = 20 * Math.log10(value);
  const clamped = Math.max(-50, Math.min(0, db));
  return ((clamped + 50) / 50) * 100;
}

function Bar({ label, level, peakPercent }: { label: string; level: number; peakPercent: number }) {
  const percent = levelToPercent(level);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-40 w-6 overflow-hidden border border-line-strong bg-ink">
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-500 via-gold to-red-bright transition-[height] duration-75"
          style={{ height: `${percent}%` }}
        />
        <div
          className="absolute inset-x-0 h-0.5 bg-white transition-[bottom] duration-150"
          style={{ bottom: `${peakPercent}%` }}
        />
        {[20, 40, 60, 80].map((mark) => (
          <div key={mark} className="absolute inset-x-0 h-px bg-ink-4" style={{ bottom: `${mark}%` }} />
        ))}
      </div>
      <span className="font-condensed text-[10px] font-bold uppercase tracking-[0.14em] text-grey-500">
        {label}
      </span>
    </div>
  );
}

export default function AudioMeter({ meter }: { meter: MeterReading }) {
  const [peakHold, setPeakHold] = useState({ left: 0, right: 0 });
  const lastUpdateRef = useRef<number | null>(null);

  useEffect(() => {
    const now = Date.now();
    const elapsed = lastUpdateRef.current === null ? 0 : now - lastUpdateRef.current;
    lastUpdateRef.current = now;
    const decay = Math.min(3, elapsed / 40);

    setPeakHold((prev) => ({
      left: Math.max(levelToPercent(meter.left), prev.left - decay),
      right: Math.max(levelToPercent(meter.right), prev.right - decay),
    }));
  }, [meter.left, meter.right]);

  return (
    <div className="flex items-center gap-6">
      <div className="flex gap-3">
        <Bar label="L" level={meter.left} peakPercent={peakHold.left} />
        <Bar label="R" level={meter.right} peakPercent={peakHold.right} />
      </div>
      <div className="flex flex-col gap-2">
        <div
          className={cn(
            "flex items-center gap-2 border px-3 py-1.5 font-condensed text-xs font-bold uppercase tracking-[0.12em] transition-colors",
            meter.clipping ? "border-red bg-red/10 text-red-bright" : "border-line-strong text-grey-500"
          )}
        >
          <span className={cn("size-1.5 rounded-full", meter.clipping ? "bg-red-bright" : "bg-grey-600")} />
          Clip
        </div>
        <div
          className={cn(
            "flex items-center gap-2 border px-3 py-1.5 font-condensed text-xs font-bold uppercase tracking-[0.12em] transition-colors",
            meter.gateOpen ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-line-strong text-grey-500"
          )}
        >
          <span className={cn("size-1.5 rounded-full", meter.gateOpen ? "bg-emerald-400" : "bg-grey-600")} />
          Gate
        </div>
      </div>
    </div>
  );
}
