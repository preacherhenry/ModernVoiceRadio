"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { station } from "@/data/station";
import type { StreamStatus } from "@/lib/stream/types";

const POLL_INTERVAL_MS = 20000;
const BEACON_HEARTBEAT_MS = 60000;

type NowPlaying = { song: string; artist: string };

export type LiveBroadcastInfo = {
  status: "CONNECTING" | "LIVE" | "OFFLINE" | "ENDED";
  programName?: string;
  presenterName?: string;
  episodeTitle?: string;
  coverImage?: string;
  startedAt?: string | null;
};

type PlayerState = {
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  muted: boolean;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;

  nowPlaying: NowPlaying | null;
  listeners: number | null;
  peakListeners: number | null;
  bitrateKbps: number | null;
  artworkUrl: string | null;
  streamOnline: boolean | null;
  statusStale: boolean;

  liveBroadcast: LiveBroadcastInfo | null;
  emergency: { active: boolean; message?: string };
};

const PlayerContext = createContext<PlayerState | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);

  const [streamStatus, setStreamStatus] = useState<StreamStatus | null>(null);
  const [statusStale, setStatusStale] = useState(false);

  const [liveBroadcast, setLiveBroadcast] = useState<LiveBroadcastInfo | null>(null);
  const [emergency, setEmergency] = useState<{ active: boolean; message?: string }>({ active: false });
  const [manualNowPlaying, setManualNowPlaying] = useState<NowPlaying | null>(null);

  // Icecast poll: authoritative for the actual on-air song/artist/listeners/bitrate.
  useEffect(() => {
    let cancelled = false;
    let activeController: AbortController | null = null;

    async function poll() {
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;

      try {
        const res = await fetch("/api/now-playing", { signal: controller.signal });
        if (!res.ok) throw new Error(`now-playing request failed: ${res.status}`);
        const data: StreamStatus = await res.json();
        if (!cancelled) {
          setStreamStatus(data);
          setStatusStale(false);
        }
      } catch (err) {
        if (!cancelled && !(err instanceof DOMException && err.name === "AbortError")) {
          setStatusStale(true);
        }
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      activeController?.abort();
      clearInterval(id);
    };
  }, []);

  // SSE: push updates for studio broadcast status, manual now-playing overrides, and emergencies.
  useEffect(() => {
    let source: EventSource | null = null;
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      source = new EventSource("/api/live-updates");

      source.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "status") {
            const payload = parsed.payload as LiveBroadcastInfo;
            setLiveBroadcast(payload.status === "OFFLINE" ? null : payload);
            if (payload.status === "OFFLINE") setManualNowPlaying(null);
          } else if (parsed.type === "now-playing") {
            const payload = parsed.payload as { song: string; artist: string };
            setManualNowPlaying(payload.song ? payload : null);
          } else if (parsed.type === "emergency") {
            setEmergency(parsed.payload);
          } else if (parsed.type === "listeners") {
            setStreamStatus((prev) => (prev ? { ...prev, listeners: parsed.payload.count } : prev));
          }
        } catch {
          // ignore malformed events
        }
      };

      source.onerror = () => {
        source?.close();
        if (!cancelled) setTimeout(connect, 5000);
      };
    }

    connect();
    return () => {
      cancelled = true;
      source?.close();
    };
  }, []);

  // Analytics beacon: on load, then a heartbeat while actively playing.
  useEffect(() => {
    const send = () => {
      fetch("/api/listener-beacon", { method: "POST", keepalive: true }).catch(() => undefined);
    };
    send();
    const id = setInterval(() => {
      if (isPlaying) send();
    }, BEACON_HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        setIsPlaying(false);
      });
  }, [isPlaying]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (v > 0) setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const nowPlaying: NowPlaying | null =
    manualNowPlaying ??
    (!streamStatus
      ? null
      : streamStatus.title
        ? { song: streamStatus.title, artist: streamStatus.artist ?? station.name }
        : { song: "Live Broadcast", artist: `${station.name} ${station.frequency}` });

  return (
    <PlayerContext.Provider
      value={{
        isPlaying,
        isLoading,
        volume,
        muted,
        togglePlay,
        setVolume,
        toggleMute,

        nowPlaying,
        listeners: streamStatus?.listeners ?? null,
        peakListeners: streamStatus?.peakListeners ?? null,
        bitrateKbps: streamStatus?.bitrateKbps ?? null,
        artworkUrl: streamStatus?.artworkUrl ?? null,
        streamOnline: streamStatus ? streamStatus.online : null,
        statusStale,

        liveBroadcast,
        emergency,
      }}
    >
      <audio
        ref={audioRef}
        src={station.streamUrl}
        preload="none"
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onError={() => {
          setIsPlaying(false);
          setIsLoading(false);
        }}
      />
      {children}
    </PlayerContext.Provider>
  );
}
