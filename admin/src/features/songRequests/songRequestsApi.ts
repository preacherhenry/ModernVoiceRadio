import { baseApi } from '@api/baseApi';
import type { ApiEnvelope, SongRequest } from '@apptypes/models';

export const songRequestsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSongRequests: builder.query<ApiEnvelope<SongRequest[]>, { page?: number; status?: string } | void>({
      query: (params) => ({ url: '/song-requests', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((r) => ({ type: 'SongRequest' as const, id: r.id })), { type: 'SongRequest' as const, id: 'LIST' }]
        : [{ type: 'SongRequest' as const, id: 'LIST' }]),
    }),
    updateSongRequestStatus: builder.mutation<ApiEnvelope<SongRequest>, { id: string; status: SongRequest['status'] }>({
      query: ({ id, status }) => ({ url: `/song-requests/${id}/status`, method: 'PATCH', data: { status } }),
      invalidatesTags: [{ type: 'SongRequest', id: 'LIST' }],
    }),
  }),
});

export const { useGetSongRequestsQuery, useUpdateSongRequestStatusMutation } = songRequestsApi;
