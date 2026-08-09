import audioStreamRepository from '../repositories/audioStreamRepository.js';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';

const EMPTY_NOW_PLAYING = {
  songTitle: null, artist: null, listeners: null, isLive: false,
};

/** Icecast often reports "Artist - Title" as a single string; split on the first " - ". */
const splitArtistTitle = (raw) => {
  if (!raw || typeof raw !== 'string') return { artist: null, songTitle: null };
  const separatorIndex = raw.indexOf(' - ');
  if (separatorIndex === -1) return { artist: null, songTitle: raw.trim() };
  return {
    artist: raw.slice(0, separatorIndex).trim(),
    songTitle: raw.slice(separatorIndex + 3).trim(),
  };
};

export const audioStreamService = {
  listActive: async () => audioStreamRepository.listActive(),

  getActiveDefault: async () => {
    const stream = await audioStreamRepository.findDefault();
    if (!stream) throw ApiError.notFound('No default stream is configured');
    return stream;
  },

  /**
   * Fetches and parses Icecast status-json.xsl metadata for the "now playing" screen.
   * Never throws — any failure degrades to a null now-playing payload with a 200.
   */
  getNowPlaying: async (streamId) => {
    try {
      const stream = streamId
        ? await audioStreamRepository.findById(streamId)
        : await audioStreamRepository.findDefault();

      if (!stream || !stream.metadata_url) return EMPTY_NOW_PLAYING;

      const response = await fetch(stream.metadata_url, { signal: AbortSignal.timeout(4000) });
      if (!response.ok) return EMPTY_NOW_PLAYING;

      const payload = await response.json();
      const source = payload && payload.icestats ? payload.icestats.source : null;
      const sources = Array.isArray(source) ? source : (source ? [source] : []);

      // Some providers (e.g. Stream-Africa) run one shared Icecast server hosting many
      // stations under a single status-json.xsl — match this stream's own mount point
      // rather than assuming the first entry belongs to us.
      let mountName = null;
      try { mountName = new URL(stream.url).pathname.split('/').filter(Boolean).pop() || null; } catch { /* ignore */ }
      const sourceEntry = (mountName && sources.find((s) => (s.listenurl || '').endsWith(`/${mountName}`))) || sources[0];
      if (!sourceEntry) return EMPTY_NOW_PLAYING;

      const rawTitle = sourceEntry.title || sourceEntry.yp_currently_playing || null;
      const { artist, songTitle } = splitArtistTitle(rawTitle);

      return {
        songTitle: songTitle || null,
        artist: artist || sourceEntry.artist || null,
        listeners: typeof sourceEntry.listeners === 'number' ? sourceEntry.listeners : null,
        isLive: true,
      };
    } catch (err) {
      logger.warn(`Now-playing lookup failed: ${err.message}`);
      return EMPTY_NOW_PLAYING;
    }
  },

  create: async (data) => audioStreamRepository.create(data),

  update: async (id, data) => {
    const existing = await audioStreamRepository.findById(id);
    if (!existing) throw ApiError.notFound('Audio stream not found');
    return audioStreamRepository.update(id, data);
  },

  remove: async (id) => {
    const existing = await audioStreamRepository.findById(id);
    if (!existing) throw ApiError.notFound('Audio stream not found');
    await audioStreamRepository.remove(id);
  },
};

export default audioStreamService;
