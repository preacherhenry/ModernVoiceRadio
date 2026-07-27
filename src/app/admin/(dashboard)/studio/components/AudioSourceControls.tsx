"use client";

import { Hand, Headphones, Mic, MicOff, MonitorSpeaker } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AudioSourceKind } from "@/hooks/useBroadcastAudio";

const sourceOptions: { value: AudioSourceKind; label: string }[] = [
  { value: "microphone", label: "Microphone / Interface" },
  { value: "system", label: "System Audio" },
];

export default function AudioSourceControls({
  source,
  onSourceChange,
  deviceId,
  onDeviceChange,
  inputDevices,
  outputDevices,
  onMonitorDeviceChange,
  gain,
  onGainChange,
  muted,
  onMuteToggle,
  onPushToTalkDown,
  onPushToTalkUp,
  monitorEnabled,
  onMonitorToggle,
  disabled,
}: {
  source: AudioSourceKind;
  onSourceChange: (source: AudioSourceKind) => void;
  deviceId: string;
  onDeviceChange: (deviceId: string) => void;
  inputDevices: MediaDeviceInfo[];
  outputDevices: MediaDeviceInfo[];
  onMonitorDeviceChange: (deviceId: string) => void;
  gain: number;
  onGainChange: (value: number) => void;
  muted: boolean;
  onMuteToggle: () => void;
  onPushToTalkDown: () => void;
  onPushToTalkUp: () => void;
  monitorEnabled: boolean;
  onMonitorToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-grey-400">
          Audio Source
        </p>
        <div className="flex gap-2">
          {sourceOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onSourceChange(opt.value)}
              className={cn(
                "flex-1 border px-3 py-2.5 font-condensed text-xs font-semibold uppercase tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                source === opt.value
                  ? "border-gold bg-gold text-ink"
                  : "border-line-strong text-grey-300 hover:border-gold hover:text-gold"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {source === "microphone" && (
        <div>
          <label className="mb-2 block font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-grey-400">
            Input Device
          </label>
          <select
            value={deviceId}
            disabled={disabled}
            onChange={(e) => onDeviceChange(e.target.value)}
            className="w-full appearance-none border border-line-strong bg-ink px-4 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">System Default</option>
            {inputDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || "Microphone"}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-2 block font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-grey-400">
          Output Monitor
        </label>
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => onMonitorDeviceChange(e.target.value)}
            className="flex-1 appearance-none border border-line-strong bg-ink px-4 py-2.5 text-sm text-white"
          >
            <option value="">System Default</option>
            {outputDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || "Speaker"}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onMonitorToggle}
            aria-label={monitorEnabled ? "Mute monitor" : "Enable monitor"}
            className={cn(
              "flex size-10 shrink-0 items-center justify-center border transition-colors",
              monitorEnabled
                ? "border-gold bg-gold/10 text-gold"
                : "border-line-strong text-grey-500 hover:text-white"
            )}
          >
            <Headphones className="size-4" />
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-grey-400">
            Gain
          </label>
          <span className="font-condensed text-xs text-grey-500">{Math.round(gain * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={2}
          step={0.01}
          value={gain}
          onChange={(e) => onGainChange(Number(e.target.value))}
          className="h-1 w-full cursor-pointer appearance-none bg-ink-4 accent-gold"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onMuteToggle}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 border px-3 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.1em] transition-colors",
            muted
              ? "border-red bg-red/10 text-red-bright"
              : "border-line-strong text-grey-300 hover:border-white hover:text-white"
          )}
        >
          {muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          {muted ? "Muted" : "Live Mic"}
        </button>
        <button
          type="button"
          onMouseDown={onPushToTalkDown}
          onMouseUp={onPushToTalkUp}
          onMouseLeave={onPushToTalkUp}
          onTouchStart={onPushToTalkDown}
          onTouchEnd={onPushToTalkUp}
          className="flex flex-1 items-center justify-center gap-2 border border-line-strong px-3 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.1em] text-grey-300 transition-colors hover:border-white hover:text-white active:border-gold active:text-gold"
        >
          <Hand className="size-4" />
          Push To Talk
        </button>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-grey-500">
        <MonitorSpeaker className="size-3.5" />
        USB interfaces, mixers and virtual audio cables all appear as input devices above once connected.
      </p>
    </div>
  );
}
