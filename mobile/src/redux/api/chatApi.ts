import { baseApi } from './baseApi';
import type { ApiEnvelope, ChatMessage } from '@apptypes/models';

/** REST covers chat history + pinned messages; sending/receiving live is Socket.io — see services/chatSocketService.ts */
export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatHistory: builder.query<ApiEnvelope<ChatMessage[]>, { page?: number; order?: 'asc' | 'desc' } | void>({
      query: (params) => ({ url: '/chat/messages', params: params ?? undefined }),
      providesTags: [{ type: 'ChatMessage', id: 'LIST' }],
    }),
    getPinnedMessages: builder.query<ApiEnvelope<ChatMessage[]>, void>({
      query: () => ({ url: '/chat/messages/pinned' }),
      providesTags: [{ type: 'ChatMessage', id: 'PINNED' }],
    }),
    getChatLockState: builder.query<ApiEnvelope<{ locked: boolean }>, void>({
      query: () => ({ url: '/chat/lock' }),
      providesTags: [{ type: 'ChatMessage', id: 'LOCK' }],
    }),
  }),
});

export const {
  useGetChatHistoryQuery, useGetPinnedMessagesQuery, useGetChatLockStateQuery,
} = chatApi;
