import { baseApi } from '@api/baseApi';
import type { ApiEnvelope, AuthUser } from '@apptypes/models';

interface AuthPayload {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiEnvelope<AuthPayload>, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', data: body }),
    }),
    logout: builder.mutation<ApiEnvelope<null>, { refreshToken: string }>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', data: body }),
    }),
    getMe: builder.query<ApiEnvelope<AuthUser>, void>({
      query: () => ({ url: '/auth/me' }),
      providesTags: ['Me'],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery, useLazyGetMeQuery } = authApi;
