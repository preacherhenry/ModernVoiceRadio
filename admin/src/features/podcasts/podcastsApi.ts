import { baseApi } from '@api/baseApi';
import type {
  ApiEnvelope, Podcast, PodcastCategory, PodcastEpisode,
} from '@apptypes/models';

export const podcastsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPodcastCategories: builder.query<ApiEnvelope<PodcastCategory[]>, void>({
      query: () => ({ url: '/podcasts/categories' }),
      providesTags: [{ type: 'PodcastCategory', id: 'LIST' }],
    }),
    getPodcasts: builder.query<ApiEnvelope<Podcast[]>, { page?: number; search?: string; category_id?: string } | void>({
      query: (params) => ({ url: '/podcasts', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((p) => ({ type: 'Podcast' as const, id: p.id })), { type: 'Podcast' as const, id: 'LIST' }]
        : [{ type: 'Podcast' as const, id: 'LIST' }]),
    }),
    getPodcast: builder.query<ApiEnvelope<Podcast>, string>({
      query: (id) => ({ url: `/podcasts/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Podcast', id }],
    }),
    createPodcast: builder.mutation<ApiEnvelope<Podcast>, FormData>({
      query: (data) => ({ url: '/podcasts', method: 'POST', data }),
      invalidatesTags: [{ type: 'Podcast', id: 'LIST' }],
    }),
    updatePodcast: builder.mutation<ApiEnvelope<Podcast>, { id: string; data: FormData }>({
      query: ({ id, data }) => ({ url: `/podcasts/${id}`, method: 'PUT', data }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Podcast', id }, { type: 'Podcast', id: 'LIST' }],
    }),
    deletePodcast: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/podcasts/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Podcast', id: 'LIST' }],
    }),

    getEpisodes: builder.query<ApiEnvelope<PodcastEpisode[]>, { podcastId: string; page?: number }>({
      query: ({ podcastId, ...params }) => ({ url: `/podcasts/${podcastId}/episodes`, params }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((e) => ({ type: 'Episode' as const, id: e.id })), { type: 'Episode' as const, id: 'LIST' }]
        : [{ type: 'Episode' as const, id: 'LIST' }]),
    }),
    createEpisode: builder.mutation<ApiEnvelope<PodcastEpisode>, { podcastId: string; data: FormData }>({
      query: ({ podcastId, data }) => ({ url: `/podcasts/${podcastId}/episodes`, method: 'POST', data }),
      invalidatesTags: [{ type: 'Episode', id: 'LIST' }],
    }),
    updateEpisode: builder.mutation<ApiEnvelope<PodcastEpisode>, { id: string; data: FormData }>({
      query: ({ id, data }) => ({ url: `/podcasts/episodes/${id}`, method: 'PUT', data }),
      invalidatesTags: [{ type: 'Episode', id: 'LIST' }],
    }),
    deleteEpisode: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/podcasts/episodes/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Episode', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPodcastCategoriesQuery, useGetPodcastsQuery, useGetPodcastQuery,
  useCreatePodcastMutation, useUpdatePodcastMutation, useDeletePodcastMutation,
  useGetEpisodesQuery, useCreateEpisodeMutation, useUpdateEpisodeMutation, useDeleteEpisodeMutation,
} = podcastsApi;
