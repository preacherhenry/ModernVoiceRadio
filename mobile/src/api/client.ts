import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@constants/config';
import { getStoreRef } from '@redux/storeAccessor';
import {
  setTokens, signedOut, persistTokens, clearPersistedTokens,
} from '@redux/slices/authSlice';

export const httpClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 15000,
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = getStoreRef().getState().auth;
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * Endpoints that must never trigger a refresh-and-retry: /refresh would recurse into
 * itself, and the rest are unauthenticated, where a 401 means "wrong credentials", not
 * "expired token".
 *
 * `/auth/me` is deliberately NOT in this list. It's an authenticated endpoint called on
 * every cold start, almost always with an access token that has already expired (they
 * last 15 minutes), so it is precisely the request that needs a silent refresh. A
 * previous blanket `url.includes('/auth/')` check caught it too, which meant every cold
 * start failed /auth/me, wiped the stored tokens and forced a manual login — despite a
 * refresh token that stays valid for 30 days.
 */
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
];

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const store = getStoreRef();
  const { refreshToken } = store.getState().auth;
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post(`${ENV.API_URL}/auth/refresh`, { refreshToken });
    const { accessToken: newAccess, refreshToken: newRefresh } = data.data;
    store.dispatch(setTokens({ accessToken: newAccess, refreshToken: newRefresh }));
    await persistTokens(newAccess, newRefresh);
    return newAccess;
  } catch {
    store.dispatch(signedOut());
    await clearPersistedTokens();
    return null;
  }
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    const skipRefresh = NO_REFRESH_PATHS.some((path) => originalRequest?.url?.includes(path));

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !skipRefresh) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
      }
      const newToken = await refreshPromise;

      if (newToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return httpClient(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default httpClient;
