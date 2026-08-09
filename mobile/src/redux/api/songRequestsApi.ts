import { baseApi } from './baseApi';
import type { ApiEnvelope, SongRequest } from '@apptypes/models';

export const songRequestsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitSongRequest: builder.mutation<ApiEnvelope<SongRequest>, { requesterName: string; songTitle: string; artistName: string; message?: string }>({
      query: (data) => ({ url: '/song-requests', method: 'POST', data }),
    }),
  }),
});

export const { useSubmitSongRequestMutation } = songRequestsApi;
