import { baseApi } from './baseApi';
import type { ApiEnvelope, Program } from '@apptypes/models';

export const programsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrograms: builder.query<ApiEnvelope<Program[]>, { page?: number; search?: string } | void>({
      query: (params) => ({ url: '/programs', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((p) => ({ type: 'Program' as const, id: p.id })), { type: 'Program' as const, id: 'LIST' }]
        : [{ type: 'Program' as const, id: 'LIST' }]),
    }),
    getProgram: builder.query<ApiEnvelope<Program>, string>({
      query: (idOrSlug) => ({ url: `/programs/${idOrSlug}` }),
      providesTags: (result, error, idOrSlug) => [{ type: 'Program', id: idOrSlug }],
    }),
  }),
});

export const { useGetProgramsQuery, useGetProgramQuery } = programsApi;
