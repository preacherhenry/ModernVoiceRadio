import TrackPlayer, {
  Capability, Event, RepeatMode, AppKilledPlaybackBehavior, State,
} from 'react-native-track-player';
import { getStoreRef } from '@redux/storeAccessor';
import {
  loadTrack, setPlaybackState, setSleepTimer, setPlayerError, stopPlayback, type PlaybackState,
} from '@redux/slices/playerSlice';
import type { AudioStream, NowPlayingInfo, PodcastEpisode } from '@apptypes/models';
import { ENV } from '@constants/config';
import { joinLiveListenerPresence, leaveLiveListenerPresence } from './listenerPresenceService';

let isSetup = false;
let sleepTimerHandle: ReturnType<typeof setTimeout> | null = null;

const RNTP_STATE_MAP: Partial<Record<State, PlaybackState>> = {
  [State.Buffering]: 'buffering',
  [State.Connecting]: 'loading',
  [State.Playing]: 'playing',
  [State.Paused]: 'paused',
  [State.Stopped]: 'idle',
  [State.Ended]: 'idle',
  [State.Error]: 'error',
  [State.Ready]: 'paused',
};

/** One-time player setup — call once from App.tsx before any playback occurs. */
export async function setupAudioPlayer(): Promise<void> {
  if (isSetup) return;

  await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
  await TrackPlayer.updateOptions({
    android: { appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback },
    capabilities: [
      Capability.Play, Capability.Pause, Capability.Stop, Capability.SeekTo,
      Capability.JumpForward, Capability.JumpBackward,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    progressUpdateEventInterval: 2,
  });
  await TrackPlayer.setRepeatMode(RepeatMode.Off);

  TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
    const mapped = RNTP_STATE_MAP[state];
    if (mapped) getStoreRef().dispatch(setPlaybackState(mapped));

    // Healthy playback clears the backoff, so the next interruption starts from a short
    // delay rather than inheriting the previous one's.
    if (state === State.Playing) reconnectAttempts = 0;

    // A dropped live stream does not always surface as an error — an Icecast restart or a
    // network handover often just ends the track. Nothing listened for that, so playback
    // died silently. lastLiveStream is cleared before a deliberate stop, and
    // isStartingPlayback covers the reset() inside playLiveStream, so neither is mistaken
    // for a drop here.
    const endedUnexpectedly = state === State.Ended || state === State.Stopped;
    if (endedUnexpectedly && lastLiveStream && !playbackBlocked && !isStartingPlayback) {
      void reconnectLiveIfNeeded();
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
    getStoreRef().dispatch(setPlayerError(error?.message || 'Playback error — reconnecting…'));
    void reconnectLiveIfNeeded();
  });

  isSetup = true;
}

let lastLiveStream: AudioStream | null = null;
let reconnectAttempts = 0;

/**
 * While true, nothing may start or resume audio — set when the session ends or the user
 * is on an authentication screen. A flag is needed rather than just stopping once,
 * because playback can restart on its own: the error handler below retries a dropped
 * live stream on a delay, so a retry already in flight would otherwise bring the audio
 * back moments after logout.
 */
let playbackBlocked = false;
let isReconnecting = false;
/** True while playLiveStream is switching tracks, whose reset() emits a stop we must ignore. */
let isStartingPlayback = false;

/** Stops any audio and prevents it restarting until playback is explicitly allowed again. */
export async function blockPlayback(): Promise<void> {
  playbackBlocked = true;
  // Stops the retry loop below from resuming: it re-reads both of these after its delay.
  lastLiveStream = null;
  reconnectAttempts = Number.MAX_SAFE_INTEGER;
  // A pending sleep timer belongs to the session that just ended.
  cancelSleepTimer();
  await stopAudioPlayback();
}

/** Re-enables playback — the user is back in the app proper. Does not start anything. */
export function allowPlayback(): void {
  playbackBlocked = false;
  reconnectAttempts = 0;
}

export const isPlaybackBlocked = () => playbackBlocked;

/** Longest gap between reconnect attempts — slow enough to be kind to a flaky connection. */
const MAX_RECONNECT_DELAY_MS = 30000;

/**
 * Brings live radio back after the stream drops.
 *
 * This deliberately never stops trying. It previously gave up after five attempts, which
 * suits a file that failed to load but not a 24/7 station: once a bad patch of signal
 * exhausted those attempts, the radio stayed silent for the rest of the session even
 * after the connection came back, and the listener had to notice and press play again.
 * The delay grows to a ceiling instead, so a phone that is off-network simply retries
 * quietly until it isn't.
 */
async function reconnectLiveIfNeeded() {
  if (playbackBlocked || !lastLiveStream) return;
  if (isReconnecting) return; // one loop at a time, however many events arrive
  isReconnecting = true;

  try {
    while (!playbackBlocked && lastLiveStream) {
      reconnectAttempts += 1;
      const delay = Math.min(2000 * reconnectAttempts, MAX_RECONNECT_DELAY_MS);
      // eslint-disable-next-line no-await-in-loop -- attempts are deliberately spaced
      await new Promise((resolve) => { setTimeout(resolve, delay); });
      // Re-check after the delay: the session may have ended while this was waiting.
      if (playbackBlocked || !lastLiveStream) return;
      try {
        // eslint-disable-next-line no-await-in-loop -- sequential by design
        await playLiveStream(lastLiveStream);
        return; // reconnectAttempts is reset once playback actually reports Playing
      } catch {
        // keep looping — the next pass waits longer
      }
    }
  } finally {
    isReconnecting = false;
  }
}

/** Starts/switches live radio playback for a given stream config (bitrate/protocol selection). */
export async function playLiveStream(stream: AudioStream, nowPlaying?: NowPlayingInfo | null): Promise<void> {
  if (playbackBlocked) return;
  await setupAudioPlayer();
  lastLiveStream = stream;

  // reset() below emits a stop, which the state listener would otherwise read as the
  // stream dropping and answer by reconnecting — straight into a loop.
  isStartingPlayback = true;
  try {
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: `live-${stream.id}`,
      url: stream.url,
      title: nowPlaying?.songTitle || 'Modern Voice Radio — Live',
      artist: nowPlaying?.artist || 'On Air Now',
      isLiveStream: true,
    });
    await TrackPlayer.play();
  } finally {
    isStartingPlayback = false;
  }

  getStoreRef().dispatch(loadTrack({
    source: 'live',
    id: stream.id,
    title: nowPlaying?.songTitle || 'Modern Voice Radio',
    artist: nowPlaying?.artist || 'Live Broadcast',
    artworkUrl: null,
    url: stream.url,
  }));
}

/** Starts on-demand podcast episode playback, optionally resuming from a saved position. */
export async function playEpisode(episode: PodcastEpisode, resumeFromSeconds = 0): Promise<void> {
  if (playbackBlocked) return;
  await setupAudioPlayer();
  lastLiveStream = null;

  isStartingPlayback = true;
  try {
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: `episode-${episode.id}`,
      url: episode.audio_url,
      title: episode.title,
      artist: episode.podcast_title || 'Modern Voice Radio',
      artwork: episode.cover_image_url || undefined,
      duration: episode.duration_seconds,
    });
    if (resumeFromSeconds > 0) await TrackPlayer.seekTo(resumeFromSeconds);
    await TrackPlayer.play();
  } finally {
    isStartingPlayback = false;
  }

  getStoreRef().dispatch(loadTrack({
    source: 'episode',
    id: episode.id,
    title: episode.title,
    artist: episode.podcast_title || 'Podcast',
    artworkUrl: episode.cover_image_url,
    url: episode.audio_url,
    durationSeconds: episode.duration_seconds,
  }));
}

/**
 * Pausing or stopping ends the listening session immediately; resuming live radio opens
 * a new one. Handled here rather than per screen so a session closes however playback
 * was ended — the mini player, the Live screen, or the lock-screen controls.
 */
export const pausePlayback = async () => {
  const { currentTrack } = getStoreRef().getState().player;
  if (currentTrack?.source === 'live') leaveLiveListenerPresence();
  await TrackPlayer.pause();
};

export const resumePlayback = async () => {
  if (playbackBlocked) return;
  const { currentTrack } = getStoreRef().getState().player;
  if (currentTrack?.source === 'live' && lastLiveStream) {
    joinLiveListenerPresence(lastLiveStream.id);
  }
  await TrackPlayer.play();
};

export const stopAudioPlayback = async () => {
  leaveLiveListenerPresence();
  lastLiveStream = null;
  await TrackPlayer.stop();
  await TrackPlayer.reset();
  getStoreRef().dispatch(stopPlayback());
};
export const seekAudioTo = (seconds: number) => TrackPlayer.seekTo(seconds);
export const jumpForward = (seconds = 30) => TrackPlayer.seekBy(seconds);
export const jumpBackward = (seconds = 15) => TrackPlayer.seekBy(-seconds);
export const setPlayerVolume = (volume: number) => TrackPlayer.setVolume(volume);

/** Starts (or replaces) a sleep timer that pauses playback after `minutes`. */
export function startSleepTimer(minutes: number): void {
  if (sleepTimerHandle) clearTimeout(sleepTimerHandle);
  const endsAt = Date.now() + minutes * 60 * 1000;
  getStoreRef().dispatch(setSleepTimer(endsAt));
  sleepTimerHandle = setTimeout(() => {
    void pausePlayback();
    getStoreRef().dispatch(setSleepTimer(null));
    sleepTimerHandle = null;
  }, minutes * 60 * 1000);
}

export function cancelSleepTimer(): void {
  if (sleepTimerHandle) clearTimeout(sleepTimerHandle);
  sleepTimerHandle = null;
  getStoreRef().dispatch(setSleepTimer(null));
}

export const DEFAULT_STREAM_FALLBACK: AudioStream = {
  id: 'default',
  name: 'Modern Voice Radio',
  protocol: 'icecast',
  url: ENV.DEFAULT_STREAM_URL,
  bitrate_kbps: 128,
  format: 'mp3',
  is_default: true,
};
