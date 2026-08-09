import { query } from '../config/database.js';

export const songRequestRepository = {
  create: async ({
    userId, requesterName, songTitle, artistName, message,
  }) => {
    const { rows } = await query(
      `INSERT INTO song_requests (user_id, requester_name, song_title, artist_name, message)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [userId || null, requesterName, songTitle, artistName, message || null],
    );
    return rows[0];
  },

  list: async ({ offset, limit, status }) => {
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const listParams = [...params, limit, offset];

    const { rows } = await query(
      `SELECT * FROM song_requests ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams,
    );

    const { rows: countRows } = await query(
      `SELECT COUNT(*)::int AS count FROM song_requests ${whereClause}`,
      params,
    );

    return { rows, total: countRows[0].count };
  },

  findById: async (id) => {
    const { rows } = await query('SELECT * FROM song_requests WHERE id = $1', [id]);
    return rows[0] || null;
  },

  updateStatus: async (id, status) => {
    const { rows } = await query(
      'UPDATE song_requests SET status = $2 WHERE id = $1 RETURNING *',
      [id, status],
    );
    return rows[0] || null;
  },
};

export default songRequestRepository;
