import { baseApi } from '@api/baseApi';
import type { ApiEnvelope, Presenter, Program } from '@apptypes/models';

export interface ProgramDetail extends Program {
  presenters: Presenter[];
  schedule: unknown[];
}

export const programsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrograms: builder.query<ApiEnvelope<Program[]>, { page?: number; search?: string; category?: string } | void>({
      query: (params) => ({ url: '/programs', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((p) => ({ type: 'Program' as const, id: p.id })), { type: 'Program' as const, id: 'LIST' }]
        : [{ type: 'Program' as const, id: 'LIST' }]),
    }),
    getProgram: builder.query<ApiEnvelope<ProgramDetail>, string>({
      query: (idOrSlug) => ({ url: `/programs/${idOrSlug}` }),
      providesTags: (_result, _error, id) => [{ type: 'Program', id }],
    }),
    createProgram: builder.mutation<ApiEnvelope<ProgramDetail>, FormData>({
      query: (data) => ({ url: '/programs', method: 'POST', data }),
      invalidatesTags: [{ type: 'Program', id: 'LIST' }],
    }),
    updateProgram: builder.mutation<ApiEnvelope<ProgramDetail>, { id: string; data: FormData }>({
      query: ({ id, data }) => ({ url: `/programs/${id}`, method: 'PUT', data }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Program', id }, { type: 'Program', id: 'LIST' }],
    }),
    deleteProgram: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/programs/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Program', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProgramsQuery,
  useGetProgramQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
} = programsApi;
