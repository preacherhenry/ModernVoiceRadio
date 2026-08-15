import { io, type Socket } from 'socket.io-client';
import { ENV } from '@constants/config';
import { getStoreRef } from '@redux/storeAccessor';
import type { ChatMessage } from '@apptypes/models';

let socket: Socket | null = null;

/**
 * Connects (once) to the shared Socket.io server — chat and listener-presence handlers
 * both live on the default namespace server-side (see backend/src/sockets/*.js), each
 * scoped to their own room ("chat" / "live-listeners"), so there is a single connection here.
 */
export function connectChatSocket(): Socket {
  if (socket?.connected) return socket;

  const { accessToken } = getStoreRef().getState().auth;

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

/**
 * Re-authenticates an already-open socket connection. Needed because the socket connects
 * once (e.g. on first mount of the chat screen) and stays connected — if that happened
 * before the access token was ready (redux-persist rehydration, login, or a token refresh
 * happening later), the connection is left permanently anonymous server-side with no
 * automatic retry. The backend already listens for this 'authenticate' event; this was
 * simply never called after the initial connection.
 */
export function authenticateChatSocket(token: string): void {
  if (!token) return;
  const s = connectChatSocket();
  s.emit('authenticate', { token });
}

export function sendChatMessage(message: string, replyToId?: string): void {
  socket?.emit('send_message', { message, replyToId });
}

export function onNewChatMessage(callback: (message: ChatMessage) => void): () => void {
  const s = connectChatSocket();
  s.on('new_message', callback);
  return () => s.off('new_message', callback);
}

export function onChatModeration(callbacks: {
  onPinned?: (message: ChatMessage) => void;
  onDeleted?: (messageId: string) => void;
  onError?: (message: string) => void;
}): () => void {
  const s = connectChatSocket();
  // The server emits 'error' as a { message } payload, not a bare string —
  // unwrap it here so the public callback contract (a plain string) always holds.
  const handleError = (payload: { message?: string } | string) => {
    callbacks.onError?.(typeof payload === 'string' ? payload : (payload?.message ?? 'Something went wrong'));
  };
  if (callbacks.onPinned) s.on('message_pinned', callbacks.onPinned);
  if (callbacks.onDeleted) s.on('message_deleted', callbacks.onDeleted);
  if (callbacks.onError) s.on('error', handleError);
  return () => {
    if (callbacks.onPinned) s.off('message_pinned', callbacks.onPinned);
    if (callbacks.onDeleted) s.off('message_deleted', callbacks.onDeleted);
    if (callbacks.onError) s.off('error', handleError);
  };
}

/**
 * Fires whenever an admin creates, edits, activates/deactivates or deletes an advert
 * (see backend/src/controllers/advertisementController.js). The event is only a signal —
 * which adverts a device should show depends on placement, the active flag and the
 * station-local date window, so the app refetches rather than trusting a pushed payload.
 *
 * Lives here because this module owns the single shared socket connection; adding a
 * second connection just for adverts would be wasteful.
 */
export function onAdvertisementsChanged(callback: () => void): () => void {
  const s = connectChatSocket();
  const handler = () => callback();
  s.on('advertisements_changed', handler);
  return () => s.off('advertisements_changed', handler);
}

/** The admin dashboard broadcasts this whenever it locks/unlocks the chat. */
export function onChatLockChanged(callback: (locked: boolean) => void): () => void {
  const s = connectChatSocket();
  const handleLockChanged = ({ locked }: { locked: boolean }) => callback(locked);
  s.on('chat_lock_changed', handleLockChanged);
  return () => s.off('chat_lock_changed', handleLockChanged);
}
