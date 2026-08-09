import { query } from '../config/database.js';

export const ENTITY_TYPES = ['podcast', 'episode', 'news', 'program', 'presenter'];

export const favoriteRepository = {
  list: async ({
    userId, entityType, offset, limit,
  }) => {
    const conditions = ['user_id = $1'];
    const params = [userId];

    if (entityType) {
      params.push(entityType);
      conditions.push(`entity_type = $${params.length}`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const listParams = [...params, limit, offset];

    const { rows } = await query(
      `SELECT * FROM favorites ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams,
    );

    const { rows: countRows } = await query(
      `SELECT COUNT(*)::int AS count FROM favorites ${whereClause}`,
      params,
    );

    return { rows, total: countRows[0].count };
  },

  add: async ({ userId, entityType, entityId }) => {
    const { rows } = await query(
      `INSERT INTO favorites (user_id, entity_type, entity_id)
       VALUES ($1,$2,$3)
       ON CONFLICT (user_id, entity_type, entity_id) DO NOTHING
       RETURNING *`,
      [userId, entityType, entityId],
    );
    if (rows[0]) return rows[0];

    const { rows: existing } = await query(
      'SELECT * FROM favorites WHERE user_id = $1 AND entity_type = $2 AND entity_id = $3',
      [userId, entityType, entityId],
    );
    return existing[0] || null;
  },

  remove: async ({ userId, entityType, entityId }) => {
    const { rowCount } = await query(
      'DELETE FROM favorites WHERE user_id = $1 AND entity_type = $2 AND entity_id = $3',
      [userId, entityType, entityId],
    );
    return rowCount > 0;
  },

  exists: async ({ userId, entityType, entityId }) => {
    const { rows } = await query(
      'SELECT 1 FROM favorites WHERE user_id = $1 AND entity_type = $2 AND entity_id = $3',
      [userId, entityType, entityId],
    );
    return rows.length > 0;
  },
};

export default favoriteRepository;
