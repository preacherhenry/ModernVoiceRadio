import { query } from '../config/database.js';

export const listeningHistoryRepository = {
  insert: async ({
    userId, entityType, entityId, durationSeconds, deviceType,
  }) => {
    const { rows } = await query(
      `INSERT INTO listening_history (user_id, entity_type, entity_id, duration_seconds, device_type)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [userId || null, entityType, entityId || null, durationSeconds || 0, deviceType || null],
    );
    return rows[0];
  },

  listForUser: async ({ userId, offset, limit }) => {
    const { rows } = await query(
      `SELECT * FROM listening_history WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    const { rows: countRows } = await query(
      'SELECT COUNT(*)::int AS count FROM listening_history WHERE user_id = $1',
      [userId],
    );
    return { rows, total: countRows[0].count };
  },
};

export default listeningHistoryRepository;
