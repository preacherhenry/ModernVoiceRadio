import { baseApi } from './baseApi';
import type { ApiEnvelope, AuthUser } from '@apptypes/models';

interface ListeningHistoryEntry {
  id: string;
  entity_type: 'live' | 'episode';
  entity_id: string | null;
  duration_seconds: number;
  device_type: string | null;
  created_at: string;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<ApiEnvelope<AuthUser>, FormData>({
      query: (formData) => ({ url: '/users/me', method: 'PATCH', data: formData }),
      invalidatesTags: ['Me'],
    }),
    changePassword: builder.mutation<ApiEnvelope<null>, { currentPassword: string; newPassword: string }>({
      query: (data) => ({ url: '/users/me/password', method: 'PUT', data }),
    }),
    updateFcmToken: builder.mutation<ApiEnvelope<null>, { fcmToken: string }>({
      query: (data) => ({ url: '/users/me/fcm-token', method: 'PUT', data }),
    }),
    updatePushPreference: builder.mutation<ApiEnvelope<null>, { pushEnabled: boolean }>({
      query: (data) => ({ url: '/users/me/push-preference', method: 'PATCH', data }),
    }),
    getListeningHistory: builder.query<ApiEnvelope<ListeningHistoryEntry[]>, { page?: number } | void>({
      query: (params) => ({ url: '/users/me/history', params: params ?? undefined }),
    }),
    logListen: builder.mutation<ApiEnvelope<null>, { entityType: 'live' | 'episode'; entityId?: string; durationSeconds: number; deviceType: string }>({
      query: (data) => ({ url: '/users/me/history', method: 'POST', data }),
    }),
  }),
});

export const {
  useUpdateProfileMutation, useChangePasswordMutation, useUpdateFcmTokenMutation,
  useUpdatePushPreferenceMutation, useGetListeningHistoryQuery, useLogListenMutation,
} = usersApi;
