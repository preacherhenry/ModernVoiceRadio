import { query } from '../config/database.js';

export const notificationRepository = {
  create: async ({
    title, body, type, imageUrl, data, targetTopic, createdBy,
  }) => {
    const { rows } = await query(
      `INSERT INTO notifications (title, body, type, image_url, data, target_topic, created_by, sent_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7, now())
       RETURNING *`,
      [title, body, type || 'announcement', imageUrl || null, JSON.stringify(data || {}), targetTopic || 'all', createdBy],
    );
    return rows[0];
  },

  list: async ({ offset, limit }) => {
    const { rows } = await query(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset],
    );
    const { rows: countRows } = await query('SELECT COUNT(*)::int AS count FROM notifications');
    return { rows, total: countRows[0].count };
  },

  listForUser: async ({ userId, offset, limit }) => {
    const { rows } = await query(
      `SELECT n.*, COALESCE(un.is_read, false) AS is_read, un.read_at
       FROM notifications n
       LEFT JOIN user_notifications un ON un.notification_id = n.id AND un.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    const { rows: countRows } = await query('SELECT COUNT(*)::int AS count FROM notifications');
    return { rows, total: countRows[0].count };
  },

  markRead: async ({ userId, notificationId }) => {
    const { rows } = await query(
      `INSERT INTO user_notifications (user_id, notification_id, is_read, read_at)
       VALUES ($1,$2,true, now())
       ON CONFLICT (user_id, notification_id) DO UPDATE SET is_read = true, read_at = now()
       RETURNING *`,
      [userId, notificationId],
    );
    return rows[0];
  },

  unreadCount: async (userId) => {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS count FROM notifications n
       LEFT JOIN user_notifications un ON un.notification_id = n.id AND un.user_id = $1
       WHERE COALESCE(un.is_read, false) = false`,
      [userId],
    );
    return rows[0].count;
  },

  findById: async (id) => {
    const { rows } = await query('SELECT * FROM notifications WHERE id = $1', [id]);
    return rows[0] || null;
  },
};

export default notificationRepository;
