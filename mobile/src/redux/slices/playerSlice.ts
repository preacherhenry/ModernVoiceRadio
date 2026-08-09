import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type PlaybackSource = 'live' | 'episode';
export type PlaybackState = 'idle' | 'loading' | 'buffering' | 'playing' | 'paused' | 'error';

interface NowPlayingTrack {
  source: PlaybackSource;
  id: string; // stream id for live, episode id for podcast
  title: string;
  artist: string | null;
  artworkUrl: string | null;
  url: string;
  durationSeconds?: number; // episodes only
}

interface PlayerState {
  playbackState: PlaybackState;
  currentTrack: NowPlayingTrack | null;
  positionSeconds: number;
  volume: number;
  isMiniPlayerVisible: boolean;
  sleepTimerEndsAt: number | null; // epoch ms
  liveListenerCount: number | null;
  selectedBitrateKbps: number;
  errorMessage: string | null;
}

const initialState: PlayerState = {
  playbackState: 'idle',
  currentTrack: null,
  positionSeconds: 0,
  volume: 1,
  isMiniPlayerVisible: false,
  sleepTimerEndsAt: null,
  liveListenerCount: null,
  selectedBitrateKbps: 128,
  errorMessage: null,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    loadTrack(state, action: PayloadAction<NowPlayingTrack>) {
      state.currentTrack = action.payload;
      state.playbackState = 'loading';
      state.isMiniPlayerVisible = true;
      state.positionSeconds = 0;
      state.errorMessage = null;
    },
    setPlaybackState(state, action: PayloadAction<PlaybackState>) {
      state.playbackState = action.payload;
    },
    setPosition(state, action: PayloadAction<number>) {
      state.positionSeconds = action.payload;
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = action.payload;
    },
    setMiniPlayerVisible(state, action: PayloadAction<boolean>) {
      state.isMiniPlayerVisible = action.payload;
    },
    setSleepTimer(state, action: PayloadAction<number | null>) {
      state.sleepTimerEndsAt = action.payload;
    },
    setLiveListenerCount(state, action: PayloadAction<number | null>) {
      state.liveListenerCount = action.payload;
    },
    setSelectedBitrate(state, action: PayloadAction<number>) {
      state.selectedBitrateKbps = action.payload;
    },
    setPlayerError(state, action: PayloadAction<string | null>) {
      state.errorMessage = action.payload;
      state.playbackState = action.payload ? 'error' : state.playbackState;
    },
    stopPlayback(state) {
      state.playbackState = 'idle';
      state.currentTrack = null;
      state.positionSeconds = 0;
    },
  },
});

export const {
  loadTrack, setPlaybackState, setPosition, setVolume, setMiniPlayerVisible,
  setSleepTimer, setLiveListenerCount, setSelectedBitrate, setPlayerError, stopPlayback,
} = playerSlice.actions;
export default playerSlice.reducer;
