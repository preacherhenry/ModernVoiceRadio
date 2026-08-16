import { query } from '../config/database.js';

/**
 * The station's timezone. Every "day" in listener analytics — today's figures, active
 * days, returning listeners — is bucketed in Zambian local time, not the database's UTC,
 * so a listener at 1am local is counted on the day they experienced.
 */
const STATION_TZ = 'Africa/Lusaka';

/**
 * Only sessions that represent real listening: attributed to an account, finished, and
 * long enough not to be a reconnect blip. Defined once and reused by every query below
 * so no metric can quietly disagree with another about what counts.
 *
 * `alias` lets the same definition serve both bare and joined queries without rewriting
 * the SQL by hand. minSeconds is coerced to a number rather than parameterised because it
 * is a server-side constant, never user input.
 */
const registeredSessionFilter = (minSeconds, alias = '') => {
  const col = alias ? `${alias}.` : '';
  return `${col}user_id IS NOT NULL
    AND ${col}duration_seconds IS NOT NULL
    AND ${col}duration_seconds >= ${Number(minSeconds)}`;
};

/** Builds the date-window clause and its parameters for a period selection. */
const windowClause = (from, to, startIndex, alias = '') => {
  const col = alias ? `${alias}.started_at` : 'started_at';
  const conditions = [];
  const params = [];
  if (from) {
    params.push(from);
    conditions.push(`(${col} AT TIME ZONE '${STATION_TZ}')::date >= $${startIndex + params.length - 1}::date`);
  }
  if (to) {
    params.push(to);
    conditions.push(`(${col} AT TIME ZONE '${STATION_TZ}')::date <= $${startIndex + params.length - 1}::date`);
  }
  return { clause: conditions.length ? `AND ${conditions.join(' AND ')}` : '', params };
};

export const analyticsRepository = {
  STATION_TZ,

  todayStats: async () => {
    const { rows } = await query(
      `SELECT
         COUNT(*)::int AS today_sessions,
         COUNT(DISTINCT COALESCE(user_id::text, session_key))::int AS today_unique_listeners,
         COALESCE(SUM(duration_seconds), 0)::bigint AS today_total_duration_seconds
       FROM listener_sessions
       -- "Today" in the station's own timezone: on UTC these counters rolled over at
       -- 02:00 local, so late-night listening landed on the previous day.
       WHERE (started_at AT TIME ZONE '${STATION_TZ}')::date
             = (now() AT TIME ZONE '${STATION_TZ}')::date`,
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

  // ── Registered-listener analytics ──────────────────────────────────────────
  // All of these count only sessions tied to an account, so guests never inflate them.

  /** Headline figures for the selected period. */
  listenerSummary: async ({ from, to, minSeconds }) => {
    const { clause, params } = windowClause(from, to, 1);
    const { rows } = await query(
      `WITH sessions AS (
         SELECT user_id, duration_seconds,
                (started_at AT TIME ZONE '${STATION_TZ}')::date AS local_day
         FROM listener_sessions
         WHERE ${registeredSessionFilter(minSeconds)} ${clause}
       ),
       per_user AS (
         SELECT user_id,
                SUM(duration_seconds)::bigint AS total_seconds,
                COUNT(*)::int AS session_count,
                COUNT(DISTINCT local_day)::int AS active_days
         FROM sessions GROUP BY user_id
       )
       SELECT
         (SELECT COUNT(*)::int FROM per_user) AS unique_listeners,
         (SELECT COALESCE(SUM(total_seconds), 0)::bigint FROM per_user) AS total_seconds,
         (SELECT COALESCE(ROUND(AVG(duration_seconds)), 0)::int FROM sessions) AS average_session_seconds,
         -- "Returning" means listening on more than one distinct local day, which is a
         -- truer signal of a habit than simply having more than one session.
         (SELECT COUNT(*)::int FROM per_user WHERE active_days > 1) AS returning_listeners`,
      params,
    );
    return rows[0];
  },

  /** One row per registered listener, for the dashboard table and "most active" card. */
  listenerBreakdown: async ({
    from, to, minSeconds, sortBy = 'total_seconds', limit = 50, offset = 0,
  }) => {
    const { clause, params } = windowClause(from, to, 1, 's');
    const sortColumn = {
      total_seconds: 'total_seconds',
      session_count: 'session_count',
      active_days: 'active_days',
      last_listened_at: 'last_listened_at',
    }[sortBy] ?? 'total_seconds';

    const listParams = [...params, limit, offset];
    const { rows } = await query(
      `SELECT
         u.id            AS user_id,
         u.full_name,
         u.email,
         u.avatar_url,
         SUM(s.duration_seconds)::bigint            AS total_seconds,
         COUNT(*)::int                              AS session_count,
         COUNT(DISTINCT (s.started_at AT TIME ZONE '${STATION_TZ}')::date)::int AS active_days,
         MAX(s.started_at)                          AS last_listened_at
       FROM listener_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE ${registeredSessionFilter(minSeconds, 's')} ${clause}
       GROUP BY u.id, u.full_name, u.email, u.avatar_url
       ORDER BY ${sortColumn} DESC NULLS LAST
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams,
    );

    // Same alias as the query above, since `clause` is built against "s".
    const { rows: countRows } = await query(
      `SELECT COUNT(DISTINCT s.user_id)::int AS count
       FROM listener_sessions s
       WHERE ${registeredSessionFilter(minSeconds, 's')} ${clause}`,
      params,
    );

    return { rows, total: countRows[0].count };
  },

  /** Every session for one listener, newest first, plus their totals. */
  listenerHistory: async ({
    userId, from, to, minSeconds, limit = 100, offset = 0,
  }) => {
    const { clause, params } = windowClause(from, to, 2);
    const listParams = [userId, ...params, limit, offset];
    const { rows } = await query(
      `SELECT id, started_at, ended_at, duration_seconds, device_type, country
       FROM listener_sessions
       WHERE user_id = $1
         AND duration_seconds IS NOT NULL
         AND duration_seconds >= ${Number(minSeconds)}
         ${clause}
       ORDER BY started_at DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams,
    );

    const { rows: totals } = await query(
      `SELECT
         COALESCE(SUM(duration_seconds), 0)::bigint AS total_seconds,
         COUNT(*)::int AS session_count,
         COUNT(DISTINCT (started_at AT TIME ZONE '${STATION_TZ}')::date)::int AS active_days,
         MIN(started_at) AS first_listened_at,
         MAX(started_at) AS last_listened_at
       FROM listener_sessions
       WHERE user_id = $1
         AND duration_seconds IS NOT NULL
         AND duration_seconds >= ${Number(minSeconds)}
         ${clause}`,
      [userId, ...params],
    );

    const { rows: userRows } = await query(
      'SELECT id, full_name, email, avatar_url FROM users WHERE id = $1',
      [userId],
    );

    return { user: userRows[0] || null, totals: totals[0], sessions: rows };
  },
};

export default analyticsRepository;
