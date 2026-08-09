import { baseApi } from '@api/baseApi';
import type { ApiEnvelope, AudioStream } from '@apptypes/models';

interface AudioStreamInput {
  name: string;
  url: string;
  protocol: AudioStream['protocol'];
  format: string;
  bitrateKbps: number;
  metadataUrl?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export const audioStreamsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAudioStreams: builder.query<ApiEnvelope<AudioStream[]>, void>({
      query: () => ({ url: '/streams' }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((s) => ({ type: 'Stream' as const, id: s.id })), { type: 'Stream' as const, id: 'LIST' }]
        : [{ type: 'Stream' as const, id: 'LIST' }]),
    }),
    createAudioStream: builder.mutation<ApiEnvelope<AudioStream>, AudioStreamInput>({
      query: (data) => ({ url: '/streams', method: 'POST', data }),
      invalidatesTags: [{ type: 'Stream', id: 'LIST' }],
    }),
    updateAudioStream: builder.mutation<ApiEnvelope<AudioStream>, { id: string; data: Partial<AudioStreamInput> }>({
      query: ({ id, data }) => ({ url: `/streams/${id}`, method: 'PUT', data }),
      invalidatesTags: [{ type: 'Stream', id: 'LIST' }],
    }),
    deleteAudioStream: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/streams/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Stream', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAudioStreamsQuery, useCreateAudioStreamMutation, useUpdateAudioStreamMutation, useDeleteAudioStreamMutation,
} = audioStreamsApi;
