/** Central place for env-derived and static app configuration. */
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:4000',
  DEFAULT_STREAM_URL: process.env.EXPO_PUBLIC_DEFAULT_STREAM_URL || 'http://node.stream-africa.com:8000/ModernVoiceFM',
  HLS_STREAM_URL: process.env.EXPO_PUBLIC_HLS_STREAM_URL || '',
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
};

export const APP_NAME = 'Modern Voice FM';
export const STATION_FREQUENCY = '99.5 FM';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'mvr_access_token',
  REFRESH_TOKEN: 'mvr_refresh_token',
  HAS_ONBOARDED: 'mvr_has_onboarded',
  REDUX_PERSIST: 'mvr_root',
} as const;

export const SLEEP_TIMER_PRESETS_MIN = [15, 30, 45, 60, 90] as const;
export const AUDIO_QUALITY_OPTIONS_KBPS = [64, 128, 256] as const;
export const EQUALIZER_PRESETS = ['Flat', 'Bass Boost', 'Vocal', 'Treble Boost'] as const;

/** Maps the (English, stored-as-is) preset value to its translation key for display. */
export const EQUALIZER_PRESET_LABEL_KEYS: Record<string, string> = {
  Flat: 'settings.equalizerPresets.flat',
  'Bass Boost': 'settings.equalizerPresets.bassBoost',
  Vocal: 'settings.equalizerPresets.vocal',
  'Treble Boost': 'settings.equalizerPresets.trebleBoost',
};

export const PAGE_SIZE_DEFAULT = 20;
