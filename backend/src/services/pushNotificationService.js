import { initFirebase } from '../config/firebase.js';
import logger from '../config/logger.js';
import { personalize } from '../utils/personalize.js';

/** FCM data payloads must be flat maps of string -> string. */
const stringifyData = (data = {}) => Object.fromEntries(
  Object.entries(data).map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)]),
);

/** `sendEach` accepts at most 500 messages per call. */
const FCM_BATCH_LIMIT = 500;

const chunk = (items, size) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

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

  /**
   * Sends an individually personalized push to each recipient.
   *
   * A topic broadcast is a single message fanned out by FCM, so it physically cannot
   * carry a different name per person. Personalized sends therefore address devices
   * directly by token — one distinct message per recipient — batched through `sendEach`
   * (max 500 per call).
   *
   * Never throws, matching `sendToTopic`: delivery is best-effort and must not block the
   * admin's notification record from being created.
   *
   * @param {Array<{ id: string, full_name: string|null, fcm_token: string }>} recipients
   * @param {{ title: string, body: string, imageUrl?: string, data?: object }} template
   *        `title`/`body` may contain {firstName}/{name} placeholders.
   * @returns {Promise<{ sent: number, failed: number, skipped: boolean }>}
   */
  sendPersonalized: async (recipients, {
    title, body, imageUrl, data,
  } = {}) => {
    const admin = initFirebase();
    if (!admin) {
      logger.warn(`Personalized push skipped (Firebase not configured): "${title}" for ${recipients.length} recipient(s)`);
      return { sent: 0, failed: 0, skipped: true };
    }
    if (!recipients.length) {
      logger.warn(`Personalized push skipped: no recipients with a registered device token for "${title}"`);
      return { sent: 0, failed: 0, skipped: true };
    }

    const payloadData = stringifyData(data);
    const messages = recipients.map((recipient) => ({
      token: recipient.fcm_token,
      notification: {
        title: personalize(title, { fullName: recipient.full_name }),
        body: personalize(body, { fullName: recipient.full_name }),
        ...(imageUrl ? { imageUrl } : {}),
      },
      data: payloadData,
      android: {
        priority: 'high',
        notification: { ...(imageUrl ? { imageUrl } : {}) },
      },
      apns: {
        payload: { aps: { sound: 'default' } },
        ...(imageUrl ? { fcmOptions: { imageUrl } } : {}),
      },
    }));

    let sent = 0;
    let failed = 0;

    for (const batch of chunk(messages, FCM_BATCH_LIMIT)) {
      try {
        // eslint-disable-next-line no-await-in-loop -- batches must stay sequential to respect FCM rate limits
        const result = await admin.messaging().sendEach(batch);
        sent += result.successCount;
        failed += result.failureCount;
      } catch (err) {
        failed += batch.length;
        logger.error(`Personalized push batch failed for "${title}": ${err.message}`);
      }
    }

    logger.info(`Personalized push "${title}": ${sent} sent, ${failed} failed across ${recipients.length} recipient(s)`);
    return { sent, failed, skipped: false };
  },
};

export default pushNotificationService;
