import { baseApi } from '@api/baseApi';
import type { ApiEnvelope, Advertisement } from '@apptypes/models';

export const advertisementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdvertisements: builder.query<ApiEnvelope<Advertisement[]>, { page?: number } | void>({
      query: (params) => ({ url: '/advertisements', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((a) => ({ type: 'Advertisement' as const, id: a.id })), { type: 'Advertisement' as const, id: 'LIST' }]
        : [{ type: 'Advertisement' as const, id: 'LIST' }]),
    }),
    createAdvertisement: builder.mutation<ApiEnvelope<Advertisement>, FormData>({
      query: (data) => ({ url: '/advertisements', method: 'POST', data }),
      invalidatesTags: [{ type: 'Advertisement', id: 'LIST' }],
    }),
    updateAdvertisement: builder.mutation<ApiEnvelope<Advertisement>, { id: string; data: FormData }>({
      query: ({ id, data }) => ({ url: `/advertisements/${id}`, method: 'PUT', data }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Advertisement', id }, { type: 'Advertisement', id: 'LIST' }],
    }),
    deleteAdvertisement: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/advertisements/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Advertisement', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAdvertisementsQuery, useCreateAdvertisementMutation, useUpdateAdvertisementMutation, useDeleteAdvertisementMutation,
} = advertisementsApi;
