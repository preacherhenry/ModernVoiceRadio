import { baseApi } from '@api/baseApi';
import type { ApiEnvelope, Presenter } from '@apptypes/models';

export const presentersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPresenters: builder.query<ApiEnvelope<Presenter[]>, { page?: number; search?: string } | void>({
      query: (params) => ({ url: '/presenters', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((p) => ({ type: 'Presenter' as const, id: p.id })), { type: 'Presenter' as const, id: 'LIST' }]
        : [{ type: 'Presenter' as const, id: 'LIST' }]),
    }),
    createPresenter: builder.mutation<ApiEnvelope<Presenter>, FormData>({
      query: (data) => ({ url: '/presenters', method: 'POST', data }),
      invalidatesTags: [{ type: 'Presenter', id: 'LIST' }],
    }),
    updatePresenter: builder.mutation<ApiEnvelope<Presenter>, { id: string; data: FormData }>({
      query: ({ id, data }) => ({ url: `/presenters/${id}`, method: 'PUT', data }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Presenter', id }, { type: 'Presenter', id: 'LIST' }],
    }),
    deletePresenter: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/presenters/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Presenter', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPresentersQuery, useCreatePresenterMutation, useUpdatePresenterMutation, useDeletePresenterMutation,
} = presentersApi;
