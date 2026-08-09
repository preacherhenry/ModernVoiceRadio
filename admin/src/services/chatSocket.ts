import { io, type Socket } from 'socket.io-client';
import { ENV, STORAGE_KEYS } from '@constants/config';
import type { ChatMessage } from '@apptypes/models';

let socket: Socket | null = null;

/** Connects (once) to the shared Socket.io server's default namespace — same server the mobile app uses. */
export function connectChatSocket(): Socket {
  if (socket?.connected) return socket;

  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  socket = io(ENV.SOCKET_URL, {
    transports: ['websocket'],
    auth: accessToken ? { token: accessToken } : undefined,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: Infinity,
  });

  return socket;
}

export function disconnectChatSocket(): void {
  socket?.disconnect();
  socket = null;
}

interface ChatLiveCallbacks {
  onNewMessage?: (message: ChatMessage) => void;
  onDeleted?: (messageId: string) => void;
  onPinned?: (message: ChatMessage) => void;
  onLockChanged?: (locked: boolean) => void;
}

/** Subscribes to live chat events for the admin moderation view; returns an unsubscribe function. */
export function onChatLiveUpdates(callbacks: ChatLiveCallbacks): () => void {
  const s = connectChatSocket();

  const handleNewMessage = (message: ChatMessage) => callbacks.onNewMessage?.(message);
  const handleDeleted = ({ id }: { id: string }) => callbacks.onDeleted?.(id);
  const handlePinned = (message: ChatMessage) => callbacks.onPinned?.(message);
  const handleLockChanged = ({ locked }: { locked: boolean }) => callbacks.onLockChanged?.(locked);

  if (callbacks.onNewMessage) s.on('new_message', handleNewMessage);
  if (callbacks.onDeleted) s.on('message_deleted', handleDeleted);
  if (callbacks.onPinned) s.on('message_pinned', handlePinned);
  if (callbacks.onLockChanged) s.on('chat_lock_changed', handleLockChanged);

  return () => {
    if (callbacks.onNewMessage) s.off('new_message', handleNewMessage);
    if (callbacks.onDeleted) s.off('message_deleted', handleDeleted);
    if (callbacks.onPinned) s.off('message_pinned', handlePinned);
    if (callbacks.onLockChanged) s.off('chat_lock_changed', handleLockChanged);
  };
}
