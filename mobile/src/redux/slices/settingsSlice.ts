import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemePreference = 'dark' | 'light' | 'system';

interface SettingsState {
  themePreference: ThemePreference;
  language: string;
  audioQualityKbps: number;
  equalizerPreset: string;
  notificationsEnabled: {
    breakingNews: boolean;
    liveShows: boolean;
    newPodcasts: boolean;
    announcements: boolean;
  };
  hasOnboarded: boolean;
}

const initialState: SettingsState = {
  themePreference: 'dark',
  language: 'en',
  audioQualityKbps: 128,
  equalizerPreset: 'Flat',
  notificationsEnabled: {
    breakingNews: true,
    liveShows: true,
    newPodcasts: true,
    announcements: true,
  },
  hasOnboarded: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemePreference(state, action: PayloadAction<ThemePreference>) {
      state.themePreference = action.payload;
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    setAudioQuality(state, action: PayloadAction<number>) {
      state.audioQualityKbps = action.payload;
    },
    setEqualizerPreset(state, action: PayloadAction<string>) {
      state.equalizerPreset = action.payload;
    },
    toggleNotificationCategory(state, action: PayloadAction<keyof SettingsState['notificationsEnabled']>) {
      state.notificationsEnabled[action.payload] = !state.notificationsEnabled[action.payload];
    },
    setHasOnboarded(state, action: PayloadAction<boolean>) {
      state.hasOnboarded = action.payload;
    },
  },
});

export const {
  setThemePreference, setLanguage, setAudioQuality, setEqualizerPreset, toggleNotificationCategory, setHasOnboarded,
} = settingsSlice.actions;
export default settingsSlice.reducer;
