import { baseApi } from '@api/baseApi';
import type { ApiEnvelope, NewsArticle, NewsCategory } from '@apptypes/models';

export const newsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNewsCategories: builder.query<ApiEnvelope<NewsCategory[]>, void>({
      query: () => ({ url: '/news/categories' }),
      providesTags: [{ type: 'NewsCategory', id: 'LIST' }],
    }),
    getNews: builder.query<ApiEnvelope<NewsArticle[]>, { page?: number; search?: string; category_id?: string } | void>({
      query: (params) => ({ url: '/news', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((n) => ({ type: 'News' as const, id: n.id })), { type: 'News' as const, id: 'LIST' }]
        : [{ type: 'News' as const, id: 'LIST' }]),
    }),
    getNewsArticle: builder.query<ApiEnvelope<NewsArticle>, string>({
      query: (idOrSlug) => ({ url: `/news/${idOrSlug}` }),
      providesTags: (_result, _error, idOrSlug) => [{ type: 'News', id: idOrSlug }],
    }),
    createNews: builder.mutation<ApiEnvelope<NewsArticle>, FormData>({
      query: (data) => ({ url: '/news', method: 'POST', data }),
      invalidatesTags: [{ type: 'News', id: 'LIST' }],
    }),
    updateNews: builder.mutation<ApiEnvelope<NewsArticle>, { id: string; data: FormData }>({
      query: ({ id, data }) => ({ url: `/news/${id}`, method: 'PUT', data }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'News', id }, { type: 'News', id: 'LIST' }],
    }),
    deleteNews: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/news/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'News', id: 'LIST' }],
    }),
    removeNewsMedia: builder.mutation<ApiEnvelope<null>, { id: string; mediaId: string }>({
      query: ({ id, mediaId }) => ({ url: `/news/${id}/media/${mediaId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'News', id }],
    }),
  }),
});

export const {
  useGetNewsCategoriesQuery,
  useGetNewsQuery,
  useGetNewsArticleQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
  useRemoveNewsMediaMutation,
} = newsApi;
