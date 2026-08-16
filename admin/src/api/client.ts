import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@constants/config';
import { getStoreRef } from '@app/storeAccessor';
import { setTokens, signedOut } from '@features/auth/authSlice';

export const httpClient = axios.create({
  baseURL: ENV.API_URL,
  // Generous because uploads stream through the API to Cloudinary: an advert with a
  // poster plus four supporting pictures, or a podcast episode's audio, easily runs past
  // 20s — and the host suspends an idle instance, so the first request after a quiet
  // spell also pays a cold start. At 20s those saves aborted client-side and surfaced as
  // a generic failure even though the server had accepted them.
  timeout: 180000,
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = getStoreRef().getState().auth;
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const store = getStoreRef();
  const { refreshToken } = store.getState().auth;
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post(`${ENV.API_URL}/auth/refresh`, { refreshToken });
    const { accessToken: newAccess, refreshToken: newRefresh } = data.data;
    store.dispatch(setTokens({ accessToken: newAccess, refreshToken: newRefresh }));
    return newAccess;
  } catch {
    store.dispatch(signedOut());
    return null;
  }
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
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
