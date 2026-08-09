import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { httpClient } from './client';

interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: unknown;
  params?: unknown;
  headers?: AxiosRequestConfig['headers'];
}

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

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Me', 'User', 'Presenter', 'Program', 'Schedule', 'Podcast', 'Episode', 'PodcastCategory',
    'News', 'NewsCategory', 'Gallery', 'Notification', 'Advertisement', 'SongRequest',
    'Stream', 'Analytics', 'Settings', 'Contact', 'ChatMessage', 'ChatLock',
  ],
  endpoints: () => ({}),
});
