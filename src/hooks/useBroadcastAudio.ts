"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MeterReading = {
  left: number;
  right: number;
  peak: number;
  clipping: boolean;
  gateOpen: boolean;
};

export type AudioSourceKind = "microphone" | "system";

type AudioElementWithSink = HTMLAudioElement & {
  setSinkId?: (deviceId: string) => Promise<void>;
};

const NOISE_GATE_THRESHOLD = 0.02;
const IDLE_METER: MeterReading = { left: 0, right: 0, peak: 0, clipping: false, gateOpen: false };

export function useBroadcastAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const monitorGainRef = useRef<GainNode | null>(null);
  const monitorAudioRef = useRef<AudioElementWithSink | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mutedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const [meter, setMeter] = useState<MeterReading>(IDLE_METER);
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const refreshDevices = useCallback(async () => {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setInputDevices(list.filter((d) => d.kind === "audioinput"));
      setOutputDevices(list.filter((d) => d.kind === "audiooutput"));
    } catch {
      // Permission not granted yet — device labels will populate after start().
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        if (ignore) return;
        setInputDevices(list.filter((d) => d.kind === "audioinput"));
        setOutputDevices(list.filter((d) => d.kind === "audiooutput"));
      } catch {
        // Permission not granted yet — device labels will populate after start().
      }
    })();

    const handler = () => refreshDevices();
    navigator.mediaDevices.addEventListener?.("devicechange", handler);
    return () => {
      ignore = true;
      navigator.mediaDevices.removeEventListener?.("devicechange", handler);
    };
  }, [refreshDevices]);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (workletNodeRef.current) {
      workletNodeRef.current.port.onmessage = null;
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    gainNodeRef.current?.disconnect();
    gainNodeRef.current = null;
    monitorGainRef.current?.disconnect();
    monitorGainRef.current = null;
    if (monitorAudioRef.current) {
      monitorAudioRef.current.pause();
      monitorAudioRef.current.srcObject = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setConnected(false);
    setMeter(IDLE_METER);
  }, []);

  const start = useCallback(
    async (params: { sessionId: string; source: AudioSourceKind; deviceId?: string }) => {
      setError(null);
      try {
        let stream: MediaStream;
        if (params.source === "system") {
          const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
          display.getVideoTracks().forEach((t) => t.stop());
          stream = new MediaStream(display.getAudioTracks());
          if (stream.getAudioTracks().length === 0) {
            throw new Error("The selected screen/window share has no audio track.");
          }
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: params.deviceId ? { exact: params.deviceId } : undefined,
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            },
          });
        }
        streamRef.current = stream;
        await refreshDevices();

        const audioContext = new AudioContext({ sampleRate: 48000 });
        audioContextRef.current = audioContext;
        await audioContext.audioWorklet.addModule("/worklets/pcm-encoder-processor.js");

        const source = audioContext.createMediaStreamSource(stream);
        const gainNode = audioContext.createGain();
        gainNodeRef.current = gainNode;

        const splitter = audioContext.createChannelSplitter(2);
        const leftAnalyser = audioContext.createAnalyser();
        const rightAnalyser = audioContext.createAnalyser();
        leftAnalyser.fftSize = 1024;
        rightAnalyser.fftSize = 1024;

        const workletNode = new AudioWorkletNode(audioContext, "pcm-encoder-processor", {
          numberOfOutputs: 0,
        });
        workletNodeRef.current = workletNode;

        // Monitor path: muted by default to avoid feedback — presenter opts in via setMonitorEnabled.
        const monitorGain = audioContext.createGain();
        monitorGain.gain.value = 0;
        monitorGainRef.current = monitorGain;
        const monitorDest = audioContext.createMediaStreamDestination();

        source.connect(gainNode);
        gainNode.connect(splitter);
        splitter.connect(leftAnalyser, 0);
        splitter.connect(rightAnalyser, Math.min(1, stream.getAudioTracks().length));
        gainNode.connect(workletNode);
        gainNode.connect(monitorGain);
        monitorGain.connect(monitorDest);

        if (!monitorAudioRef.current) {
          monitorAudioRef.current = new Audio();
        }
        monitorAudioRef.current.srcObject = monitorDest.stream;
        monitorAudioRef.current.play().catch(() => undefined);

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const ws = new WebSocket(
          `${protocol}//${window.location.host}/ws/broadcast?sessionId=${params.sessionId}`
        );
        ws.binaryType = "arraybuffer";
        wsRef.current = ws;

        await new Promise<void>((resolve, reject) => {
          ws.addEventListener("open", () => resolve(), { once: true });
          ws.addEventListener(
            "error",
            () => reject(new Error("Failed to connect to the broadcast server.")),
            { once: true }
          );
        });
        setConnected(true);

        ws.addEventListener("close", () => setConnected(false));

        workletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
          if (mutedRef.current) return;
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(event.data);
          }
        };

        const leftData = new Float32Array(leftAnalyser.fftSize);
        const rightData = new Float32Array(rightAnalyser.fftSize);

        const readLevel = (analyser: AnalyserNode, data: Float32Array<ArrayBuffer>) => {
          analyser.getFloatTimeDomainData(data);
          let peak = 0;
          let sumSquares = 0;
          for (let i = 0; i < data.length; i++) {
            const abs = Math.abs(data[i]);
            if (abs > peak) peak = abs;
            sumSquares += data[i] * data[i];
          }
          return { rms: Math.sqrt(sumSquares / data.length), peak };
        };

        const tick = () => {
          const l = readLevel(leftAnalyser, leftData);
          const r = readLevel(rightAnalyser, rightData);
          const peak = Math.max(l.peak, r.peak);
          const rmsMax = Math.max(l.rms, r.rms);
          setMeter({
            left: l.rms,
            right: r.rms,
            peak,
            clipping: peak > 0.98,
            gateOpen: rmsMax > NOISE_GATE_THRESHOLD,
          });
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        stop();
        const message = err instanceof Error ? err.message : "Failed to start the audio source.";
        setError(message);
        throw new Error(message);
      }
    },
    [refreshDevices, stop]
  );

  const setGain = useCallback((value: number) => {
    if (gainNodeRef.current) gainNodeRef.current.gain.value = value;
  }, []);

  const setMuted = useCallback((value: boolean) => {
    mutedRef.current = value;
  }, []);

  const setMonitorEnabled = useCallback((enabled: boolean) => {
    if (monitorGainRef.current) monitorGainRef.current.gain.value = enabled ? 1 : 0;
  }, []);

  const setMonitorOutputDevice = useCallback(async (deviceId: string) => {
    const audio = monitorAudioRef.current;
    if (audio?.setSinkId) {
      try {
        await audio.setSinkId(deviceId);
      } catch {
        // Browser doesn't support output routing or permission denied — non-fatal.
      }
    }
  }, []);

  useEffect(() => stop, [stop]);

  return {
    start,
    stop,
    setGain,
    setMuted,
    setMonitorEnabled,
    setMonitorOutputDevice,
    meter,
    inputDevices,
    outputDevices,
    error,
    connected,
  };
}
