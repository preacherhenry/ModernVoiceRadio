import { baseApi } from './baseApi';
import type { ApiEnvelope, AuthUser } from '@apptypes/models';

interface AuthPayload {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiEnvelope<AuthPayload>, { fullName: string; email: string; phone?: string; password: string; acceptedTerms: boolean }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', data: body }),
    }),
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
    forgotPassword: builder.mutation<ApiEnvelope<null>, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', data: body }),
    }),
    resetPassword: builder.mutation<ApiEnvelope<null>, { email: string; otp: string; newPassword: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', data: body }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
