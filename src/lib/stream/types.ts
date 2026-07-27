export type StreamStatus = {
  online: boolean;
  listeners: number | null;
  peakListeners: number | null;
  bitrateKbps: number | null;
  title: string | null;
  artist: string | null;
  artworkUrl: string | null;
  fetchedAt: string;
};

export type StreamProvider = (signal: AbortSignal) => Promise<StreamStatus>;

export function offlineStatus(): StreamStatus {
  return {
    online: false,
    listeners: null,
    peakListeners: null,
    bitrateKbps: null,
    title: null,
    artist: null,
    artworkUrl: null,
    fetchedAt: new Date().toISOString(),
  };
}
