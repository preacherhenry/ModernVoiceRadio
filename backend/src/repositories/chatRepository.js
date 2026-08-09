import { query } from '../config/database.js';

export const chatRepository = {
  /** Called directly by the Socket.io chat layer as well as the REST controller. */
  insertMessage: async ({
    userId, displayName, avatarUrl, message, replyToId, isAnnouncement,
  }) => {
    const { rows } = await query(
      `INSERT INTO chat_messages (user_id, display_name, avatar_url, message, reply_to_id, is_announcement)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [userId || null, displayName, avatarUrl || null, message, replyToId || null, !!isAnnouncement],
    );
    return rows[0];
  },

  /** Called directly by the Socket.io chat layer before allowing a send_message event. */
  isUserBanned: async (userId) => {
    if (!userId) return false;
    const { rows } = await query(
      'SELECT 1 FROM chat_bans WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > now())',
      [userId],
    );
    return rows.length > 0;
  },

  listMessages: async ({ offset, limit, order }) => {
    const { rows } = await query(
      `SELECT * FROM chat_messages WHERE is_deleted = false
       ORDER BY created_at ${order === 'desc' ? 'DESC' : 'ASC'}
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    const { rows: countRows } = await query(
      'SELECT COUNT(*)::int AS count FROM chat_messages WHERE is_deleted = false',
    );
    return { rows, total: countRows[0].count };
  },

  listPinned: async () => {
    const { rows } = await query(
      'SELECT * FROM chat_messages WHERE is_pinned = true AND is_deleted = false ORDER BY created_at DESC',
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await query('SELECT * FROM chat_messages WHERE id = $1', [id]);
    return rows[0] || null;
  },

  softDelete: async (id, deletedBy) => {
    const { rows } = await query(
      'UPDATE chat_messages SET is_deleted = true, deleted_by = $2 WHERE id = $1 RETURNING *',
      [id, deletedBy],
    );
    return rows[0] || null;
  },

  /** Soft-deletes messages older than `minutes`, returning the ids that were expired. */
  expireOlderThan: async (minutes) => {
    const { rows } = await query(
      `UPDATE chat_messages SET is_deleted = true
       WHERE is_deleted = false AND created_at < now() - ($1 || ' minutes')::interval
       RETURNING id`,
      [minutes],
    );
    return rows;
  },

  setPinned: async (id, isPinned) => {
    const { rows } = await query(
      'UPDATE chat_messages SET is_pinned = $2 WHERE id = $1 RETURNING *',
      [id, isPinned],
    );
    return rows[0] || null;
  },

  upsertBan: async ({
    userId, bannedBy, reason, expiresAt,
  }) => {
    const { rows } = await query(
      `INSERT INTO chat_bans (user_id, banned_by, reason, expires_at)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id) DO UPDATE SET
         banned_by = EXCLUDED.banned_by,
         reason = EXCLUDED.reason,
         expires_at = EXCLUDED.expires_at
       RETURNING *`,
      [userId, bannedBy || null, reason || null, expiresAt || null],
    );
    return rows[0];
  },

  removeBan: async (userId) => {
    const { rowCount } = await query('DELETE FROM chat_bans WHERE user_id = $1', [userId]);
    return rowCount > 0;
  },
};

export default chatRepository;
