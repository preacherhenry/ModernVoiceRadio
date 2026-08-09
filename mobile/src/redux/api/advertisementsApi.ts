import { baseApi } from './baseApi';
import type { ApiEnvelope, Advertisement } from '@apptypes/models';

export const advertisementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveAdvertisements: builder.query<ApiEnvelope<Advertisement[]>, { placement?: string } | void>({
      query: (params) => ({ url: '/advertisements/active', params: params ?? undefined }),
      providesTags: [{ type: 'Advertisement', id: 'LIST' }],
    }),
    registerImpression: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/advertisements/${id}/impression`, method: 'POST' }),
    }),
    registerClick: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/advertisements/${id}/click`, method: 'POST' }),
    }),
  }),
});

export const {
  useGetActiveAdvertisementsQuery, useRegisterImpressionMutation, useRegisterClickMutation,
} = advertisementsApi;
