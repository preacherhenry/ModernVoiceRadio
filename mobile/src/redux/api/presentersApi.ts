import { baseApi } from './baseApi';
import type { ApiEnvelope, Presenter } from '@apptypes/models';

export const presentersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPresenters: builder.query<ApiEnvelope<Presenter[]>, { page?: number; search?: string; featured?: boolean } | void>({
      query: (params) => ({ url: '/presenters', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((p) => ({ type: 'Presenter' as const, id: p.id })), { type: 'Presenter' as const, id: 'LIST' }]
        : [{ type: 'Presenter' as const, id: 'LIST' }]),
    }),
    getPresenter: builder.query<ApiEnvelope<Presenter>, string>({
      query: (idOrSlug) => ({ url: `/presenters/${idOrSlug}` }),
      providesTags: (result, error, idOrSlug) => [{ type: 'Presenter', id: idOrSlug }],
    }),
  }),
});

export const { useGetPresentersQuery, useGetPresenterQuery } = presentersApi;
