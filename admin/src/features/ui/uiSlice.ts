import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@constants/config';

type ThemeMode = 'dark' | 'light';

interface UiState {
  themeMode: ThemeMode;
  sidebarCollapsed: boolean;
}

const initialState: UiState = {
  themeMode: (localStorage.getItem(STORAGE_KEYS.THEME_MODE) as ThemeMode | null) || 'dark',
  sidebarCollapsed: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleThemeMode(state) {
      state.themeMode = state.themeMode === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, state.themeMode);
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const { toggleThemeMode, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
