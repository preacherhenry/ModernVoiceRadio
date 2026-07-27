import "server-only";
import type { StreamStatus } from "../types";

type AzuraCastNowPlaying = {
  listeners?: { current?: number; total?: number };
  now_playing?: {
    song?: {
      title?: string;
      artist?: string;
      art?: string;
    };
  };
  station?: {
    mounts?: Array<{ bitrate?: number }>;
  };
};

export function createAzuraCastProvider(config: { baseUrl: string; stationShortcode: string }) {
  return async function fetchAzuraCastStatus(signal: AbortSignal): Promise<StreamStatus> {
    const url = `${config.baseUrl.replace(/\/$/, "")}/api/nowplaying/${config.stationShortcode}`;
    const res = await fetch(url, { cache: "no-store", signal });
    if (!res.ok) throw new Error(`AzuraCast now-playing request failed: ${res.status}`);

    const data: AzuraCastNowPlaying = await res.json();
    const song = data.now_playing?.song;
    const bitrate = data.station?.mounts?.[0]?.bitrate;

    return {
      online: true,
      listeners: typeof data.listeners?.current === "number" ? data.listeners.current : null,
      peakListeners: null,
      bitrateKbps: typeof bitrate === "number" ? bitrate : null,
      title: song?.title?.trim() || null,
      artist: song?.artist?.trim() || null,
      artworkUrl: song?.art?.trim() || null,
      fetchedAt: new Date().toISOString(),
    };
  };
}
