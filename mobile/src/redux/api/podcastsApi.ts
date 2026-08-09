import { baseApi } from './baseApi';
import type {
  ApiEnvelope, Podcast, PodcastCategory, PodcastEpisode,
} from '@apptypes/models';

export const podcastsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPodcastCategories: builder.query<ApiEnvelope<PodcastCategory[]>, void>({
      query: () => ({ url: '/podcasts/categories' }),
    }),
    getPodcasts: builder.query<ApiEnvelope<Podcast[]>, { page?: number; search?: string; category_id?: string; featured?: boolean } | void>({
      query: (params) => ({ url: '/podcasts', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((p) => ({ type: 'Podcast' as const, id: p.id })), { type: 'Podcast' as const, id: 'LIST' }]
        : [{ type: 'Podcast' as const, id: 'LIST' }]),
    }),
    getPodcast: builder.query<ApiEnvelope<Podcast>, string>({
      query: (idOrSlug) => ({ url: `/podcasts/${idOrSlug}` }),
      providesTags: (result, error, idOrSlug) => [{ type: 'Podcast', id: idOrSlug }],
    }),
    getEpisodes: builder.query<ApiEnvelope<PodcastEpisode[]>, { podcastId: string; page?: number }>({
      query: ({ podcastId, ...params }) => ({ url: `/podcasts/${podcastId}/episodes`, params }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((e) => ({ type: 'Episode' as const, id: e.id })), { type: 'Episode' as const, id: 'LIST' }]
        : [{ type: 'Episode' as const, id: 'LIST' }]),
    }),
    registerEpisodePlay: builder.mutation<ApiEnvelope<null>, string>({
      query: (episodeId) => ({ url: `/podcasts/episodes/${episodeId}/play`, method: 'POST' }),
    }),
    updateEpisodeProgress: builder.mutation<ApiEnvelope<null>, { episodeId: string; positionSeconds: number; isCompleted?: boolean }>({
      query: ({ episodeId, ...data }) => ({ url: `/podcasts/episodes/${episodeId}/progress`, method: 'PUT', data }),
      invalidatesTags: [{ type: 'ContinueListening', id: 'LIST' }],
    }),
    getContinueListening: builder.query<ApiEnvelope<PodcastEpisode[]>, void>({
      query: () => ({ url: '/podcasts/progress/continue-listening' }),
      providesTags: [{ type: 'ContinueListening', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPodcastCategoriesQuery, useGetPodcastsQuery, useGetPodcastQuery, useGetEpisodesQuery,
  useRegisterEpisodePlayMutation, useUpdateEpisodeProgressMutation, useGetContinueListeningQuery,
} = podcastsApi;
