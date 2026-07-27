import "server-only";
import { station, streamConfig } from "@/data/station";
import { createIcecastProvider } from "./providers/icecast";
import { createShoutcastProvider } from "./providers/shoutcast";
import { createAzuraCastProvider } from "./providers/azuracast";
import { lookupArtwork } from "./artwork";
import { offlineStatus, type StreamProvider, type StreamStatus } from "./types";

const CACHE_TTL_MS = 15 * 1000;

function resolveMountPath(streamUrl: string): string {
  try {
    return new URL(streamUrl).pathname;
  } catch {
    return "/";
  }
}

function getProvider(): StreamProvider {
  switch (streamConfig.provider) {
    case "shoutcast":
      return createShoutcastProvider(streamConfig.shoutcast);
    case "azuracast":
      return createAzuraCastProvider(streamConfig.azuracast);
    case "icecast":
    default:
      return createIcecastProvider({
        statusUrl: streamConfig.icecast.statusUrl,
        mountPath: resolveMountPath(station.streamUrl),
      });
  }
}

const provider = getProvider();

let cached: StreamStatus | null = null;
let cachedAt = 0;
let inFlight: Promise<StreamStatus> | null = null;

async function fetchFreshStatus(): Promise<StreamStatus> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const status = await provider(controller.signal);
      if (status.online && status.title && status.artist && !status.artworkUrl) {
        const artworkUrl = await lookupArtwork(status.artist, status.title);
        return { ...status, artworkUrl };
      }
      return status;
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    console.error("[stream] failed to fetch stream status:", err);
    return offlineStatus();
  }
}

export async function getStreamStatus(): Promise<StreamStatus> {
  const now = Date.now();
  if (cached && now - cachedAt < CACHE_TTL_MS) {
    return cached;
  }
  if (inFlight) {
    return inFlight;
  }

  inFlight = fetchFreshStatus().then((status) => {
    cached = status;
    cachedAt = Date.now();
    inFlight = null;
    return status;
  });

  return inFlight;
}
