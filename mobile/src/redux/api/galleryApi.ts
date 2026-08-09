import { baseApi } from './baseApi';
import type { ApiEnvelope, GalleryItem } from '@apptypes/models';

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGallery: builder.query<ApiEnvelope<GalleryItem[]>, { page?: number; media_type?: 'photo' | 'video'; event_name?: string } | void>({
      query: (params) => ({ url: '/gallery', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((g) => ({ type: 'Gallery' as const, id: g.id })), { type: 'Gallery' as const, id: 'LIST' }]
        : [{ type: 'Gallery' as const, id: 'LIST' }]),
    }),
  }),
});

export const { useGetGalleryQuery } = galleryApi;
