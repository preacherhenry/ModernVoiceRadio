import { baseApi } from './baseApi';
import type { ApiEnvelope, AudioStream, NowPlayingInfo } from '@apptypes/models';

export const streamsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStreams: builder.query<ApiEnvelope<AudioStream[]>, void>({
      query: () => ({ url: '/streams' }),
      providesTags: [{ type: 'Stream', id: 'LIST' }],
    }),
    getActiveStream: builder.query<ApiEnvelope<AudioStream>, void>({
      query: () => ({ url: '/streams/active' }),
      providesTags: [{ type: 'Stream', id: 'ACTIVE' }],
    }),
    getNowPlaying: builder.query<ApiEnvelope<NowPlayingInfo>, { streamId?: string } | void>({
      query: (params) => ({ url: '/streams/now-playing', params: params ?? undefined }),
      providesTags: [{ type: 'NowPlaying', id: 'CURRENT' }],
    }),
  }),
});

export const { useGetStreamsQuery, useGetActiveStreamQuery, useGetNowPlayingQuery } = streamsApi;
