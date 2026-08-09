import { baseApi } from './baseApi';
import type { ApiEnvelope, DownloadItem } from '@apptypes/models';

export const downloadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDownloads: builder.query<ApiEnvelope<DownloadItem[]>, { page?: number } | void>({
      query: (params) => ({ url: '/downloads', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((d) => ({ type: 'Download' as const, id: d.id })), { type: 'Download' as const, id: 'LIST' }]
        : [{ type: 'Download' as const, id: 'LIST' }]),
    }),
    registerDownload: builder.mutation<ApiEnvelope<DownloadItem>, { episodeId: string; fileSizeBytes?: number }>({
      query: (data) => ({ url: '/downloads', method: 'POST', data }),
      invalidatesTags: [{ type: 'Download', id: 'LIST' }],
    }),
    removeDownload: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/downloads/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Download', id: 'LIST' }],
    }),
  }),
});

export const { useGetDownloadsQuery, useRegisterDownloadMutation, useRemoveDownloadMutation } = downloadsApi;
