import { query } from '../config/database.js';

export const analyticsRepository = {
  todayStats: async () => {
    const { rows } = await query(
      `SELECT
         COUNT(*)::int AS today_sessions,
         COUNT(DISTINCT COALESCE(user_id::text, session_key))::int AS today_unique_listeners,
         COALESCE(SUM(duration_seconds), 0)::bigint AS today_total_duration_seconds
       FROM listener_sessions
       WHERE started_at::date = current_date`,
    );
    return rows[0];
  },

  byCountry: async () => {
    const { rows } = await query(
      `SELECT country, COUNT(*)::int AS count FROM listener_sessions
       WHERE country IS NOT NULL
       GROUP BY country ORDER BY count DESC LIMIT 20`,
    );
    return rows;
  },

  byCity: async () => {
    const { rows } = await query(
      `SELECT city, COUNT(*)::int AS count FROM listener_sessions
       WHERE city IS NOT NULL
       GROUP BY city ORDER BY count DESC LIMIT 20`,
    );
    return rows;
  },

  byDevice: async () => {
    const { rows } = await query(
      `SELECT device_type, COUNT(*)::int AS count FROM listener_sessions
       WHERE device_type IS NOT NULL
       GROUP BY device_type ORDER BY count DESC LIMIT 20`,
    );
    return rows;
  },

  trend: async (days) => {
    const { rows } = await query(
      'SELECT * FROM analytics_daily ORDER BY date DESC LIMIT $1',
      [days],
    );
    return rows.reverse();
  },
};

export default analyticsRepository;
