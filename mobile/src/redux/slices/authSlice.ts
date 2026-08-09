import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import type { AuthUser } from '@apptypes/models';
import { STORAGE_KEYS } from '@constants/config';

/**
 * Deliberately does NOT import `authApi` (or anything from `@redux/api/*`) at module
 * scope. `baseApi.ts` -> `api/client.ts` -> this file would close a circular import
 * loop (this file -> authApi.ts -> baseApi.ts -> client.ts -> back here), which in
 * Metro's module system resolves `baseApi` as `undefined` inside authApi.ts at import
 * time and crashes with "Cannot read property 'injectEndpoints' of undefined". Session
 * resolution after `restoreSession` (calling GET /auth/me) is instead orchestrated from
 * App.tsx's bootstrap effect, which dispatches `sessionRestored`/`signedOut` below.
 */

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'authenticating' | 'authenticated' | 'guest';
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  status: 'idle',
};

/** Reads persisted tokens from SecureStore on cold start and hydrates the session. */
export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
    SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
  ]);
  return { accessToken, refreshToken };
});

export const persistTokens = async (accessToken: string, refreshToken: string) => {
  await Promise.all([
    SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
    SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
  ]);
};

export const clearPersistedTokens = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
  ]);
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<{ user: AuthUser; accessToken: string; refreshToken: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.status = 'authenticated';
    },
    setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    updateUser(state, action: PayloadAction<Partial<AuthUser>>) {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
    /** Dispatched once GET /auth/me resolves after a token-based cold-start restore. */
    sessionRestored(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.status = 'authenticated';
    },
    signedOut(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.status = 'guest';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload.accessToken && action.payload.refreshToken) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.status = 'authenticating'; // resolved to 'authenticated' once /auth/me succeeds
        } else {
          state.status = 'guest';
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.status = 'guest';
      });
  },
});

export const {
  setSession, setTokens, updateUser, sessionRestored, signedOut,
} = authSlice.actions;
export default authSlice.reducer;
