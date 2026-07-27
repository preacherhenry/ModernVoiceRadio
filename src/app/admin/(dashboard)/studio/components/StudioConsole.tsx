"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Radio, Square } from "lucide-react";
import type { Presenter } from "@prisma/client";
import FormField from "@/components/admin/FormField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { inputClass, selectClass } from "@/components/admin/formStyles";
import { useBroadcastAudio } from "@/hooks/useBroadcastAudio";
import StatusHeader, { type StudioPhase } from "./StatusHeader";
import AudioMeter from "./AudioMeter";
import AudioSourceControls from "./AudioSourceControls";
import CurrentSongPanel from "./CurrentSongPanel";
import {
  startBroadcastAction,
  endBroadcastAction,
  updateStreamInfoAction,
  pauseRecordingAction,
  resumeRecordingAction,
  stopRecordingAction,
} from "../actions";

type InitialSession = {
  id: string;
  status: "CONNECTING" | "LIVE";
  programName: string;
  startedAt: string | null;
  presenterId: string | null;
  episodeTitle: string | null;
  description: string | null;
  category: string | null;
  tags: string | null;
  coverImage: string | null;
};

export default function StudioConsole({
  presenters,
  initialSession,
  defaultPresenterId,
  prefill,
}: {
  presenters: Presenter[];
  initialSession: InitialSession | null;
  defaultPresenterId?: string;
  prefill?: { programName?: string; presenterId?: string; category?: string };
}) {
  const audio = useBroadcastAudio();

  const [phase, setPhase] = useState<StudioPhase>(initialSession ? "LIVE" : "OFFLINE");
  const [sessionId, setSessionId] = useState<string | null>(initialSession?.id ?? null);
  const [startedAt, setStartedAt] = useState<Date | null>(
    initialSession?.startedAt ? new Date(initialSession.startedAt) : null
  );
  const [ownsAudio, setOwnsAudio] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingState, setRecordingState] = useState<"RECORDING" | "PAUSED" | "STOPPED">("RECORDING");

  const [source, setSource] = useState<"microphone" | "system">("microphone");
  const [deviceId, setDeviceId] = useState("");
  const [gain, setGainState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [mutedBeforePtt, setMutedBeforePtt] = useState(false);
  const [monitorEnabled, setMonitorEnabled] = useState(false);

  const [durationSeconds, setDurationSeconds] = useState(0);
  const [listeners, setListeners] = useState<number | null>(null);
  const [bitrateKbps, setBitrateKbps] = useState<number | null>(null);

  const pendingFormDataRef = useRef<FormData | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (phase !== "LIVE" || !startedAt) return;
    const id = setInterval(() => {
      setDurationSeconds(Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [phase, startedAt]);

  useEffect(() => {
    if (phase === "OFFLINE") return;
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch("/api/now-playing", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          setListeners(typeof data.listeners === "number" ? data.listeners : null);
          setBitrateKbps(typeof data.bitrateKbps === "number" ? data.bitrateKbps : null);
        }
      } catch {
        // ignore transient failures
      }
    }
    poll();
    const id = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [phase]);

  const handleSubmitInfo = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    pendingFormDataRef.current = new FormData(e.currentTarget);
    setShowConfirm(true);
  }, []);

  const confirmGoLive = useCallback(async () => {
    setShowConfirm(false);
    const formData = pendingFormDataRef.current;
    if (!formData) return;

    setBusy(true);
    setError(null);
    setPhase("CONNECTING");

    const result = await startBroadcastAction({}, formData);

    if (result.error || !result.sessionId) {
      setError(result.error ?? "Failed to start the broadcast.");
      setPhase("OFFLINE");
      setBusy(false);
      return;
    }

    const newSessionId = result.sessionId;
    try {
      await audio.start({ sessionId: newSessionId, source, deviceId: deviceId || undefined });
      audio.setGain(gain);
      setSessionId(newSessionId);
      setStartedAt(new Date());
      setDurationSeconds(0);
      setOwnsAudio(true);
      setRecordingState("RECORDING");
      setPhase("LIVE");
    } catch (err) {
      await endBroadcastAction(newSessionId);
      setError(err instanceof Error ? err.message : "Failed to connect the audio source.");
      setPhase("OFFLINE");
    } finally {
      setBusy(false);
    }
  }, [audio, source, deviceId, gain]);

  const handleEndBroadcast = useCallback(async () => {
    if (!sessionId) return;
    setBusy(true);
    audio.stop();
    setOwnsAudio(false);
    await endBroadcastAction(sessionId);
    setPhase("OFFLINE");
    setSessionId(null);
    setStartedAt(null);
    setDurationSeconds(0);
    setBusy(false);
  }, [audio, sessionId]);

  const handleReconnectAudio = useCallback(async () => {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      await audio.start({ sessionId, source, deviceId: deviceId || undefined });
      audio.setGain(gain);
      setOwnsAudio(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reconnect audio.");
    } finally {
      setBusy(false);
    }
  }, [audio, sessionId, source, deviceId, gain]);

  const handlePttDown = useCallback(() => {
    setMutedBeforePtt(muted);
    setMuted(false);
    audio.setMuted(false);
  }, [audio, muted]);

  const handlePttUp = useCallback(() => {
    setMuted(mutedBeforePtt);
    audio.setMuted(mutedBeforePtt);
  }, [audio, mutedBeforePtt]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    audio.setMuted(next);
  }, [audio, muted]);

  if (phase === "OFFLINE") {
    return (
      <div className="flex flex-col gap-8">
        <StatusHeader
          phase="OFFLINE"
          durationSeconds={0}
          listeners={null}
          bitrateKbps={null}
          connectionGood={false}
        />

        {error && (
          <p className="border border-red/40 bg-red/10 px-4 py-3 text-sm text-red-bright">{error}</p>
        )}

        <form ref={formRef} onSubmit={handleSubmitInfo} className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-4 border border-line bg-ink-2 p-5">
            <h2 className="font-display text-lg font-bold text-white">Stream Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Program Name" htmlFor="programName" full>
                <input
                  id="programName"
                  name="programName"
                  type="text"
                  required
                  defaultValue={prefill?.programName}
                  placeholder="Morning Drive"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Presenter" htmlFor="presenterId">
                <select
                  id="presenterId"
                  name="presenterId"
                  defaultValue={prefill?.presenterId ?? defaultPresenterId ?? ""}
                  className={selectClass}
                >
                  <option value="">Not linked</option>
                  {presenters.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Episode Title" htmlFor="episodeTitle">
                <input id="episodeTitle" name="episodeTitle" type="text" placeholder="Optional" className={inputClass} />
              </FormField>
              <FormField label="Category" htmlFor="category">
                <input id="category" name="category" type="text" defaultValue={prefill?.category} placeholder="Talk, Music, News..." className={inputClass} />
              </FormField>
              <FormField label="Tags" htmlFor="tags" hint="Comma-separated">
                <input id="tags" name="tags" type="text" placeholder="afrobeats, live, request" className={inputClass} />
              </FormField>
              <FormField label="Description" htmlFor="description" full>
                <textarea id="description" name="description" rows={3} placeholder="What's today's show about?" className={inputClass + " resize-none"} />
              </FormField>
              <div className="sm:col-span-2">
                <ImageUploadField name="coverImage" label="Cover Image" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 border border-line bg-ink-2 p-5">
            <h2 className="font-display text-lg font-bold text-white">Audio Source</h2>
            <AudioSourceControls
              source={source}
              onSourceChange={setSource}
              deviceId={deviceId}
              onDeviceChange={setDeviceId}
              inputDevices={audio.inputDevices}
              outputDevices={audio.outputDevices}
              onMonitorDeviceChange={audio.setMonitorOutputDevice}
              gain={gain}
              onGainChange={(v) => {
                setGainState(v);
                audio.setGain(v);
              }}
              muted={muted}
              onMuteToggle={toggleMute}
              onPushToTalkDown={handlePttDown}
              onPushToTalkUp={handlePttUp}
              monitorEnabled={monitorEnabled}
              onMonitorToggle={() => {
                const next = !monitorEnabled;
                setMonitorEnabled(next);
                audio.setMonitorEnabled(next);
              }}
            />

            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex items-center justify-center gap-2.5 bg-red px-6 py-4 font-condensed text-base font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-red-dark disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-5 animate-spin" /> : <Radio className="size-5" />}
              Start Broadcast
            </button>
          </div>
        </form>

        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-sm border border-line-strong bg-ink-2 p-6">
              <h3 className="font-display text-lg font-bold text-white">Go live?</h3>
              <p className="mt-2 text-sm text-grey-400">
                Are you sure you want to begin broadcasting? Listeners on the public site will see you go
                live immediately.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="border border-line-strong px-4 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.1em] text-grey-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmGoLive}
                  className="bg-red px-4 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-red-dark"
                >
                  Go Live
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <StatusHeader
        phase={phase}
        durationSeconds={durationSeconds}
        listeners={listeners}
        bitrateKbps={bitrateKbps}
        connectionGood={audio.connected}
      />

      {error && <p className="border border-red/40 bg-red/10 px-4 py-3 text-sm text-red-bright">{error}</p>}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="border border-line bg-ink-2 p-5">
            <h2 className="mb-4 font-display text-lg font-bold text-white">Live Audio</h2>
            {ownsAudio ? (
              <>
                <AudioMeter meter={audio.meter} />
                <div className="mt-6">
                  <AudioSourceControls
                    source={source}
                    onSourceChange={() => undefined}
                    deviceId={deviceId}
                    onDeviceChange={() => undefined}
                    inputDevices={audio.inputDevices}
                    outputDevices={audio.outputDevices}
                    onMonitorDeviceChange={audio.setMonitorOutputDevice}
                    gain={gain}
                    onGainChange={(v) => {
                      setGainState(v);
                      audio.setGain(v);
                    }}
                    muted={muted}
                    onMuteToggle={toggleMute}
                    onPushToTalkDown={handlePttDown}
                    onPushToTalkUp={handlePttUp}
                    monitorEnabled={monitorEnabled}
                    onMonitorToggle={() => {
                      const next = !monitorEnabled;
                      setMonitorEnabled(next);
                      audio.setMonitorEnabled(next);
                    }}
                    disabled
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-sm text-grey-400">
                  This broadcast is live, but audio isn&apos;t connected from this browser tab.
                </p>
                <button
                  onClick={handleReconnectAudio}
                  disabled={busy}
                  className="border border-gold px-4 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.1em] text-gold hover:bg-gold/10 disabled:opacity-60"
                >
                  Reconnect Audio Here
                </button>
              </div>
            )}
          </div>

          <div className="border border-line bg-ink-2 p-5">
            <h2 className="mb-4 font-display text-lg font-bold text-white">Recording</h2>
            <div className="flex items-center gap-2">
              {recordingState === "PAUSED" ? (
                <button
                  onClick={async () => {
                    if (!sessionId) return;
                    await resumeRecordingAction(sessionId);
                    setRecordingState("RECORDING");
                  }}
                  className="flex items-center gap-2 border border-line-strong px-4 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.1em] text-grey-300 hover:border-gold hover:text-gold"
                >
                  Resume Recording
                </button>
              ) : (
                <button
                  disabled={recordingState === "STOPPED"}
                  onClick={async () => {
                    if (!sessionId) return;
                    await pauseRecordingAction(sessionId);
                    setRecordingState("PAUSED");
                  }}
                  className="flex items-center gap-2 border border-line-strong px-4 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.1em] text-grey-300 hover:border-gold hover:text-gold disabled:opacity-40"
                >
                  Pause Recording
                </button>
              )}
              <button
                disabled={recordingState === "STOPPED"}
                onClick={async () => {
                  if (!sessionId) return;
                  await stopRecordingAction(sessionId);
                  setRecordingState("STOPPED");
                }}
                className="flex items-center gap-2 border border-line-strong px-4 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.1em] text-grey-300 hover:border-red hover:text-red disabled:opacity-40"
              >
                <Square className="size-3.5" />
                Stop Recording
              </button>
              <span className="ml-auto font-condensed text-xs font-bold uppercase tracking-[0.1em] text-grey-500">
                {recordingState}
              </span>
            </div>
          </div>

          <CurrentSongPanel />
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-line bg-ink-2 p-5">
            <h2 className="mb-4 font-display text-lg font-bold text-white">Update Stream Info</h2>
            <form
              action={async (formData) => {
                if (!sessionId) return;
                await updateStreamInfoAction(sessionId, formData);
              }}
              className="grid grid-cols-1 gap-4"
            >
              <FormField label="Program Name" htmlFor="programName-live">
                <input
                  id="programName-live"
                  name="programName"
                  type="text"
                  required
                  defaultValue={initialSession?.programName}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Presenter" htmlFor="presenterId-live">
                <select
                  id="presenterId-live"
                  name="presenterId"
                  defaultValue={initialSession?.presenterId ?? defaultPresenterId ?? ""}
                  className={selectClass}
                >
                  <option value="">Not linked</option>
                  {presenters.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Episode Title" htmlFor="episodeTitle-live">
                <input
                  id="episodeTitle-live"
                  name="episodeTitle"
                  type="text"
                  defaultValue={initialSession?.episodeTitle ?? ""}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Description" htmlFor="description-live">
                <textarea
                  id="description-live"
                  name="description"
                  rows={3}
                  defaultValue={initialSession?.description ?? ""}
                  className={inputClass + " resize-none"}
                />
              </FormField>
              <ImageUploadField name="coverImage" label="Cover Image" defaultImage={initialSession?.coverImage ?? undefined} />
              <button
                type="submit"
                className="flex w-fit items-center justify-center gap-2 bg-ink-4 px-5 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-ink-3"
              >
                Save Changes
              </button>
            </form>
          </div>

          <button
            onClick={handleEndBroadcast}
            disabled={busy}
            className="flex items-center justify-center gap-2.5 border-2 border-red bg-red/10 px-6 py-4 font-condensed text-base font-bold uppercase tracking-[0.14em] text-red-bright transition-colors hover:bg-red/20 disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-5 animate-spin" /> : <Square className="size-5 fill-current" />}
            End Broadcast
          </button>
        </div>
      </div>
    </div>
  );
}
