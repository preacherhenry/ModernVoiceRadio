import { baseApi } from './baseApi';
import type { ApiEnvelope, NotificationItem } from '@apptypes/models';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query<ApiEnvelope<NotificationItem[]>, { page?: number } | void>({
      query: (params) => ({ url: '/notifications/mine', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((n) => ({ type: 'Notification' as const, id: n.id })), { type: 'Notification' as const, id: 'LIST' }]
        : [{ type: 'Notification' as const, id: 'LIST' }]),
    }),
    getUnreadCount: builder.query<ApiEnvelope<{ count: number }>, void>({
      query: () => ({ url: '/notifications/unread-count' }),
      providesTags: [{ type: 'Notification', id: 'UNREAD_COUNT' }],
    }),
    markNotificationRead: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }, { type: 'Notification', id: 'UNREAD_COUNT' }],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery, useGetUnreadCountQuery, useMarkNotificationReadMutation,
} = notificationsApi;
