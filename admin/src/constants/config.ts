export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000',
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'mvr_admin_access_token',
  REFRESH_TOKEN: 'mvr_admin_refresh_token',
  THEME_MODE: 'mvr_admin_theme_mode',
} as const;

export const APP_NAME = 'Modern Voice FM — Admin';
export const ADMIN_ROLES = ['super_admin', 'admin', 'editor', 'moderator'] as const;
export const PAGE_SIZE_DEFAULT = 20;
