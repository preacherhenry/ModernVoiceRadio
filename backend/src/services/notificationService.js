import notificationRepository from '../repositories/notificationRepository.js';
import userRepository from '../repositories/userRepository.js';
import pushNotificationService from './pushNotificationService.js';
import { personalize, hasPersonalization } from '../utils/personalize.js';
import ApiError from '../utils/ApiError.js';

export const notificationService = {
  create: async ({
    title, body, type, imageUrl, data, targetTopic, createdBy,
  }) => {
    // The template (with placeholders intact) is what gets stored. Each read path then
    // renders it for whoever is looking — that keeps one row serving every recipient
    // instead of duplicating a notification per user.
    const notification = await notificationRepository.create({
      title, body, type, imageUrl, data, targetTopic, createdBy,
    });

    // Push delivery is best-effort — a Firebase outage must never block record creation.
    if (hasPersonalization(notification.title, notification.body)) {
      // Topic broadcasts are a single fanned-out message and can't vary per person, so
      // personalized copy has to be addressed to devices individually by token.
      const recipients = await userRepository.listPushRecipients();
      await pushNotificationService.sendPersonalized(recipients, {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.image_url,
        data,
      });
    } else {
      await pushNotificationService.sendToTopic(notification.target_topic, {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.image_url,
        data,
      });
    }

    return notification;
  },

  list: async ({ offset, limit }) => notificationRepository.list({ offset, limit }),

  /**
   * The in-app feed, rendered for this reader. Same storage and same shape as before —
   * only the title/body strings are resolved, so a listener never sees a raw
   * "{firstName}" placeholder in their notification list.
   */
  listMine: async ({
    userId, fullName, offset, limit,
  }) => {
    const { rows, total } = await notificationRepository.listForUser({ userId, offset, limit });
    return {
      rows: rows.map((row) => ({
        ...row,
        title: personalize(row.title, { fullName }),
        body: personalize(row.body, { fullName }),
      })),
      total,
    };
  },

  markRead: async ({ userId, notificationId }) => {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) throw ApiError.notFound('Notification not found');
    return notificationRepository.markRead({ userId, notificationId });
  },

  unreadCount: async (userId) => notificationRepository.unreadCount(userId),
};

export default notificationService;
