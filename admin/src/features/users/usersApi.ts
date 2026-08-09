import { baseApi } from '@api/baseApi';
import type { AdminUser, ApiEnvelope } from '@apptypes/models';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ApiEnvelope<AdminUser[]>, { page?: number; search?: string } | void>({
      query: (params) => ({ url: '/users', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((u) => ({ type: 'User' as const, id: u.id })), { type: 'User' as const, id: 'LIST' }]
        : [{ type: 'User' as const, id: 'LIST' }]),
    }),
    updateUserRole: builder.mutation<ApiEnvelope<AdminUser>, { id: string; roleName: string }>({
      query: ({ id, roleName }) => ({ url: `/users/${id}/role`, method: 'PATCH', data: { roleName } }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    updateUserStatus: builder.mutation<ApiEnvelope<AdminUser>, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({ url: `/users/${id}/status`, method: 'PATCH', data: { isActive } }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
  }),
});

export const { useGetUsersQuery, useUpdateUserRoleMutation, useUpdateUserStatusMutation } = usersApi;
