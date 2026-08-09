import { baseApi } from '@api/baseApi';
import type { ApiEnvelope, GalleryItem } from '@apptypes/models';

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGallery: builder.query<ApiEnvelope<GalleryItem[]>, { page?: number; media_type?: 'photo' | 'video' } | void>({
      query: (params) => ({ url: '/gallery', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((g) => ({ type: 'Gallery' as const, id: g.id })), { type: 'Gallery' as const, id: 'LIST' }]
        : [{ type: 'Gallery' as const, id: 'LIST' }]),
    }),
    createGalleryItem: builder.mutation<ApiEnvelope<GalleryItem>, FormData>({
      query: (data) => ({ url: '/gallery', method: 'POST', data }),
      invalidatesTags: [{ type: 'Gallery', id: 'LIST' }],
    }),
    deleteGalleryItem: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/gallery/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Gallery', id: 'LIST' }],
    }),
  }),
});

export const { useGetGalleryQuery, useCreateGalleryItemMutation, useDeleteGalleryItemMutation } = galleryApi;
