import { query } from '../config/database.js';

export const downloadRepository = {
  list: async ({ userId, offset, limit }) => {
    const { rows } = await query(
      `SELECT d.*,
              pe.title AS episode_title, pe.audio_url, pe.duration_seconds AS episode_duration_seconds,
              pe.cover_image_url AS episode_cover_image_url,
              p.id AS podcast_id, p.title AS podcast_title, p.cover_image_url AS podcast_cover_image_url
       FROM downloads d
       JOIN podcast_episodes pe ON pe.id = d.episode_id
       JOIN podcasts p ON p.id = pe.podcast_id
       WHERE d.user_id = $1
       ORDER BY d.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const { rows: countRows } = await query(
      'SELECT COUNT(*)::int AS count FROM downloads WHERE user_id = $1',
      [userId],
    );

    return { rows, total: countRows[0].count };
  },

  findById: async (id) => {
    const { rows } = await query('SELECT * FROM downloads WHERE id = $1', [id]);
    return rows[0] || null;
  },

  upsert: async ({ userId, episodeId, fileSizeBytes }) => {
    const { rows } = await query(
      `INSERT INTO downloads (user_id, episode_id, file_size_bytes, status)
       VALUES ($1,$2,$3,'completed')
       ON CONFLICT (user_id, episode_id) DO UPDATE SET
         file_size_bytes = EXCLUDED.file_size_bytes,
         status = 'completed'
       RETURNING *`,
      [userId, episodeId, fileSizeBytes || null],
    );
    return rows[0];
  },

  remove: async (id) => {
    const { rowCount } = await query('DELETE FROM downloads WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

export default downloadRepository;
