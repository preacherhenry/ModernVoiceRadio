import { baseApi } from '@api/baseApi';
import type { ApiEnvelope, ChatMessage } from '@apptypes/models';

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatMessages: builder.query<ApiEnvelope<ChatMessage[]>, { page?: number; order?: 'asc' | 'desc' } | void>({
      query: (params) => ({ url: '/chat/messages', params: params ?? { order: 'desc', limit: 100 } }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((m) => ({ type: 'ChatMessage' as const, id: m.id })), { type: 'ChatMessage' as const, id: 'LIST' }]
        : [{ type: 'ChatMessage' as const, id: 'LIST' }]),
    }),
    sendChatMessage: builder.mutation<ApiEnvelope<ChatMessage>, string>({
      query: (message) => ({ url: '/chat/messages', method: 'POST', data: { message } }),
      invalidatesTags: [{ type: 'ChatMessage', id: 'LIST' }],
    }),
    deleteChatMessage: builder.mutation<ApiEnvelope<ChatMessage>, string>({
      query: (id) => ({ url: `/chat/messages/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'ChatMessage', id: 'LIST' }],
    }),
    pinChatMessage: builder.mutation<ApiEnvelope<ChatMessage>, { id: string; isPinned: boolean }>({
      query: ({ id, isPinned }) => ({ url: `/chat/messages/${id}/pin`, method: 'PATCH', data: { isPinned } }),
      invalidatesTags: [{ type: 'ChatMessage', id: 'LIST' }],
    }),
    getChatLockState: builder.query<ApiEnvelope<{ locked: boolean }>, void>({
      query: () => ({ url: '/chat/lock' }),
      providesTags: [{ type: 'ChatLock', id: 'CURRENT' }],
    }),
    setChatLockState: builder.mutation<ApiEnvelope<{ locked: boolean }>, boolean>({
      query: (locked) => ({ url: '/chat/lock', method: 'PUT', data: { locked } }),
      invalidatesTags: [{ type: 'ChatLock', id: 'CURRENT' }],
    }),
  }),
});

export const {
  useGetChatMessagesQuery,
  useSendChatMessageMutation,
  useDeleteChatMessageMutation,
  usePinChatMessageMutation,
  useGetChatLockStateQuery,
  useSetChatLockStateMutation,
} = chatApi;
