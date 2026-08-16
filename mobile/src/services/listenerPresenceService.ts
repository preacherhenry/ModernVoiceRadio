import * as Localization from 'expo-localization';
import { Platform } from 'react-native';
import { connectChatSocket } from './chatSocketService';
import { getStoreRef } from '@redux/storeAccessor';
import { setLiveListenerCount } from '@redux/slices/playerSlice';

let unsubscribe: (() => void) | null = null;
let isListening = false;

/**
 * Joins the "live-listeners" presence room, which both drives the live count and opens
 * the listening session the admin dashboard's analytics are built from. Safe to call
 * again while already listening — the server ignores a repeat join on the same socket,
 * and re-emitting here would otherwise risk double-counting.
 */
export function joinLiveListenerPresence(streamId: string): void {
  const socket = connectChatSocket();
  if (isListening) return;
  isListening = true;

  socket.emit('join_listening', {
    streamId,
    // NOTE: this is the device's locale region, not its physical location — a Zambian
    // phone set to English (US) reports "US". Treat the country breakdown accordingly.
    country: Localization.getLocales()[0]?.regionCode ?? undefined,
    deviceType: Platform.OS,
  });

  if (!unsubscribe) {
    const handler = (count: number) => getStoreRef().dispatch(setLiveListenerCount(count));
    socket.on('listener_count', handler);
    unsubscribe = () => socket.off('listener_count', handler);
  }
}

/**
 * Ends the listening session now rather than waiting for the socket to drop. Without
 * this, pausing or stopping while the app stayed open left the session open, and its
 * recorded duration ran on until the app was closed.
 */
export function leaveLiveListenerPresence(): void {
  if (isListening) {
    connectChatSocket().emit('leave_listening');
    isListening = false;
  }
  unsubscribe?.();
  unsubscribe = null;
}
