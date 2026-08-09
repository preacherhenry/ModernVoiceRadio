import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getStoreRef } from '@redux/storeAccessor';
import { usersApi } from '@redux/api/usersApi';
import { notificationsApi } from '@redux/api/notificationsApi';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Requests permission, registers the device's FCM token with the backend, subscribes to
 * the default broadcast topics, and wires foreground/background notification handling.
 * Call once from App.tsx after the Redux store + auth session are ready.
 */
export async function initPushNotifications(): Promise<void> {
  const authStatus = await messaging().requestPermission();
  const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED
    || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  if (!enabled) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const token = await messaging().getToken();
  await registerTokenIfAuthenticated(token);

  await messaging().subscribeToTopic('all');
  await messaging().subscribeToTopic('breaking_news');
  await messaging().subscribeToTopic('live_show');
  await messaging().subscribeToTopic('new_podcast');

  messaging().onTokenRefresh(registerTokenIfAuthenticated);

  messaging().onMessage(async (remoteMessage) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: remoteMessage.notification?.title ?? 'Modern Voice Radio',
        body: remoteMessage.notification?.body ?? '',
        data: remoteMessage.data ?? {},
      },
      trigger: null,
    });
    getStoreRef().dispatch(notificationsApi.util.invalidateTags([{ type: 'Notification', id: 'LIST' }, { type: 'Notification', id: 'UNREAD_COUNT' }]));
  });
}

async function registerTokenIfAuthenticated(token: string) {
  const { auth } = getStoreRef().getState();
  if (!auth.accessToken) return;
  try {
    await getStoreRef().dispatch(usersApi.endpoints.updateFcmToken.initiate({ fcmToken: token }));
  } catch {
    // best-effort — a failed token sync just means this device won't receive push until next launch
  }
}

/** Deep-link payload shape sent from the admin dashboard's notification composer. */
export interface NotificationDeepLink {
  screen?: string;
  id?: string;
}

export function getInitialNotificationDeepLink(): Promise<NotificationDeepLink | null> {
  return messaging().getInitialNotification().then((msg) => (msg?.data as NotificationDeepLink) ?? null);
}

export function onNotificationOpened(callback: (data: NotificationDeepLink) => void): () => void {
  return messaging().onNotificationOpenedApp((msg) => callback((msg.data as NotificationDeepLink) ?? {}));
}
