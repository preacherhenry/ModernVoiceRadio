import notificationRepository from '../repositories/notificationRepository.js';
import pushNotificationService from './pushNotificationService.js';
import ApiError from '../utils/ApiError.js';

export const notificationService = {
  create: async ({
    title, body, type, imageUrl, data, targetTopic, createdBy,
  }) => {
    const notification = await notificationRepository.create({
      title, body, type, imageUrl, data, targetTopic, createdBy,
    });

    // Push delivery is best-effort — a Firebase outage must never block record creation.
    await pushNotificationService.sendToTopic(notification.target_topic, {
      title: notification.title,
      body: notification.body,
      imageUrl: notification.image_url,
      data,
    });

    return notification;
  },

  list: async ({ offset, limit }) => notificationRepository.list({ offset, limit }),

  listMine: async ({ userId, offset, limit }) => notificationRepository.listForUser({ userId, offset, limit }),

  markRead: async ({ userId, notificationId }) => {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) throw ApiError.notFound('Notification not found');
    return notificationRepository.markRead({ userId, notificationId });
  },

  unreadCount: async (userId) => notificationRepository.unreadCount(userId),
};

export default notificationService;
