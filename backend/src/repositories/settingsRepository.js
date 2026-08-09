import { query } from '../config/database.js';

export const settingsRepository = {
  listAll: async () => {
    const { rows } = await query('SELECT * FROM settings ORDER BY key ASC');
    return rows;
  },

  findByKey: async (key) => {
    const { rows } = await query('SELECT * FROM settings WHERE key = $1', [key]);
    return rows[0] || null;
  },

  upsert: async (key, value, description) => {
    const { rows } = await query(
      `INSERT INTO settings (key, value, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (key) DO UPDATE SET
         value = EXCLUDED.value,
         description = COALESCE(EXCLUDED.description, settings.description),
         updated_at = now()
       RETURNING *`,
      [key, JSON.stringify(value), description || null],
    );
    return rows[0];
  },
};

export default settingsRepository;
