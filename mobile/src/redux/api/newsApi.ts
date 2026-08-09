import { baseApi } from './baseApi';
import type { ApiEnvelope, NewsArticle, NewsCategory } from '@apptypes/models';

export const newsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNewsCategories: builder.query<ApiEnvelope<NewsCategory[]>, void>({
      query: () => ({ url: '/news/categories' }),
    }),
    getNews: builder.query<ApiEnvelope<NewsArticle[]>, { page?: number; search?: string; category_id?: string; breaking?: boolean; trending?: boolean } | void>({
      query: (params) => ({ url: '/news', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((n) => ({ type: 'News' as const, id: n.id })), { type: 'News' as const, id: 'LIST' }]
        : [{ type: 'News' as const, id: 'LIST' }]),
    }),
    getNewsArticle: builder.query<ApiEnvelope<NewsArticle>, string>({
      query: (idOrSlug) => ({ url: `/news/${idOrSlug}` }),
      providesTags: (result, error, idOrSlug) => [{ type: 'News', id: idOrSlug }],
    }),
  }),
});

export const { useGetNewsCategoriesQuery, useGetNewsQuery, useGetNewsArticleQuery } = newsApi;
