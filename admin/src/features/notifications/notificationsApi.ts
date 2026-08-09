import { baseApi } from '@api/baseApi';
import type { ApiEnvelope, NotificationItem } from '@apptypes/models';

interface CreateNotificationInput {
  title: string;
  body: string;
  type?: string;
  imageUrl?: string;
  targetTopic?: string;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<ApiEnvelope<NotificationItem[]>, { page?: number } | void>({
      query: (params) => ({ url: '/notifications', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((n) => ({ type: 'Notification' as const, id: n.id })), { type: 'Notification' as const, id: 'LIST' }]
        : [{ type: 'Notification' as const, id: 'LIST' }]),
    }),
    createNotification: builder.mutation<ApiEnvelope<NotificationItem>, CreateNotificationInput>({
      query: (data) => ({ url: '/notifications', method: 'POST', data }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
  }),
});

export const { useGetNotificationsQuery, useCreateNotificationMutation } = notificationsApi;
