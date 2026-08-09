import { initFirebase } from '../config/firebase.js';
import logger from '../config/logger.js';

/** FCM data payloads must be flat maps of string -> string. */
const stringifyData = (data = {}) => Object.fromEntries(
  Object.entries(data).map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)]),
);

export const pushNotificationService = {
  /**
   * Sends a push notification to an FCM topic. Never throws — a missing Firebase
   * configuration or a delivery failure is logged and swallowed so it can never
   * break the admin's ability to create a notification record.
   * @param {string} topic
   * @param {{ title: string, body: string, imageUrl?: string, data?: object }} payload
   */
  sendToTopic: async (topic, { title, body, imageUrl, data } = {}) => {
    const admin = initFirebase();
    if (!admin) {
      logger.warn(`Push notification skipped (Firebase not configured): topic="${topic}", title="${title}"`);
      return null;
    }

    try {
      const messageId = await admin.messaging().send({
        topic,
        notification: {
          title,
          body,
          ...(imageUrl ? { imageUrl } : {}),
        },
        data: stringifyData(data),
        android: {
          priority: 'high',
          notification: {
            ...(imageUrl ? { imageUrl } : {}),
          },
        },
        apns: {
          payload: { aps: { sound: 'default' } },
          ...(imageUrl ? { fcmOptions: { imageUrl } } : {}),
        },
      });
      return messageId;
    } catch (err) {
      logger.error(`Failed to send push notification to topic "${topic}": ${err.message}`);
      return null;
    }
  },
};

export default pushNotificationService;
