import "server-only";
import { fetchJsonSecure } from "../https-json";
import { offlineStatus, type StreamStatus } from "../types";

type IcecastSource = {
  listenurl?: string;
  listeners?: number;
  listener_peak?: number;
  title?: string;
  yp_currently_playing?: string;
  bitrate?: number;
  "ice-bitrate"?: number;
};

function parseTitle(raw: string | undefined | null): { title: string | null; artist: string | null } {
  const value = raw?.trim();
  if (!value) return { title: null, artist: null };

  const separatorIndex = value.indexOf(" - ");
  if (separatorIndex === -1) return { title: value, artist: null };

  return {
    artist: value.slice(0, separatorIndex).trim() || null,
    title: value.slice(separatorIndex + 3).trim() || null,
  };
}

function findMount(sources: IcecastSource[], mountPath: string): IcecastSource | undefined {
  return sources.find((s) => {
    if (!s.listenurl) return false;
    try {
      return new URL(s.listenurl).pathname === mountPath;
    } catch {
      return s.listenurl.endsWith(mountPath);
    }
  });
}

type IcecastStatusResponse = {
  icestats?: { source?: IcecastSource | IcecastSource[] };
};

export function createIcecastProvider(config: { statusUrl: string; mountPath: string }) {
  return async function fetchIcecastStatus(signal: AbortSignal): Promise<StreamStatus> {
    const data = (await fetchJsonSecure(config.statusUrl, signal)) as IcecastStatusResponse;
    const rawSource = data?.icestats?.source;
    const sources: IcecastSource[] = Array.isArray(rawSource)
      ? rawSource
      : rawSource
        ? [rawSource]
        : [];

    const mount = findMount(sources, config.mountPath);
    if (!mount) return offlineStatus();

    const { title, artist } = parseTitle(mount.title ?? mount.yp_currently_playing);
    const bitrate = mount.bitrate ?? mount["ice-bitrate"] ?? null;

    return {
      online: true,
      listeners: typeof mount.listeners === "number" ? mount.listeners : null,
      peakListeners: typeof mount.listener_peak === "number" ? mount.listener_peak : null,
      bitrateKbps: typeof bitrate === "number" ? bitrate : null,
      title,
      artist,
      artworkUrl: null,
      fetchedAt: new Date().toISOString(),
    };
  };
}
