import "server-only";
import { offlineStatus, type StreamStatus } from "../types";

type ShoutcastStats = {
  streamstatus?: number;
  currentlisteners?: number;
  peaklisteners?: number;
  songtitle?: string;
  streamtitle?: string;
  bitrate?: number;
};

function parseSongTitle(raw: string | undefined | null): { title: string | null; artist: string | null } {
  const value = raw?.trim();
  if (!value) return { title: null, artist: null };

  const separatorIndex = value.indexOf(" - ");
  if (separatorIndex === -1) return { title: value, artist: null };

  return {
    artist: value.slice(0, separatorIndex).trim() || null,
    title: value.slice(separatorIndex + 3).trim() || null,
  };
}

export function createShoutcastProvider(config: { statsUrl: string }) {
  return async function fetchShoutcastStatus(signal: AbortSignal): Promise<StreamStatus> {
    const res = await fetch(config.statsUrl, { cache: "no-store", signal });
    if (!res.ok) throw new Error(`SHOUTcast stats request failed: ${res.status}`);

    const data: ShoutcastStats = await res.json();
    if (!data || data.streamstatus === 0) return offlineStatus();

    const { title, artist } = parseSongTitle(data.songtitle ?? data.streamtitle);

    return {
      online: true,
      listeners: typeof data.currentlisteners === "number" ? data.currentlisteners : null,
      peakListeners: typeof data.peaklisteners === "number" ? data.peaklisteners : null,
      bitrateKbps: typeof data.bitrate === "number" ? data.bitrate : null,
      title,
      artist,
      artworkUrl: null,
      fetchedAt: new Date().toISOString(),
    };
  };
}
