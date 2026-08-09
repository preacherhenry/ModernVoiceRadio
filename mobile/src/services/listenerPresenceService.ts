import * as Localization from 'expo-localization';
import { Platform } from 'react-native';
import { connectChatSocket } from './chatSocketService';
import { getStoreRef } from '@redux/storeAccessor';
import { setLiveListenerCount } from '@redux/slices/playerSlice';

let unsubscribe: (() => void) | null = null;

/** Joins the "live-listeners" presence room so the mini player / admin dashboard reflect an accurate live count. */
export function joinLiveListenerPresence(streamId: string): void {
  const socket = connectChatSocket();

  socket.emit('join_listening', {
    streamId,
    country: Localization.getLocales()[0]?.regionCode ?? undefined,
    deviceType: Platform.OS,
  });

  const handler = (count: number) => getStoreRef().dispatch(setLiveListenerCount(count));
  socket.on('listener_count', handler);
  unsubscribe = () => socket.off('listener_count', handler);
}

export function leaveLiveListenerPresence(): void {
  unsubscribe?.();
  unsubscribe = null;
}
