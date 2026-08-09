import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { httpClient } from '@api/client';

interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: unknown;
  params?: unknown;
  headers?: AxiosRequestConfig['headers'];
}

/** Lets RTK Query drive our existing axios instance (and its refresh-token interceptor) instead of fetch. */
const axiosBaseQuery = (): BaseQueryFn<AxiosBaseQueryArgs, unknown, { status?: number; message: string }> => (
  async ({
    url, method = 'GET', data, params, headers,
  }) => {
    try {
      const result = await httpClient({
        url, method, data, params, headers,
      });
      return { data: result.data };
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return {
        error: {
          status: error.response?.status,
          message: error.response?.data?.message || error.message || 'Request failed',
        },
      };
    }
  }
);

/**
 * Single root RTK Query API. Every resource injects its endpoints into this instance
 * (via `.injectEndpoints`) so they all share one cache, one middleware, and one set of
 * tag types — see redux/store.ts for where its reducer + middleware are wired in.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Me', 'Presenter', 'Program', 'Schedule', 'Reminder', 'Podcast', 'Episode', 'ContinueListening',
    'News', 'Gallery', 'Notification', 'Advertisement', 'SongRequest', 'Favorite', 'Download',
    'Stream', 'NowPlaying', 'Analytics', 'Settings', 'Contact', 'ChatMessage', 'User',
  ],
  endpoints: () => ({}),
});
