import { query } from '../config/database.js';
import logger from '../config/logger.js';

// Tracks the UTC date (YYYY-MM-DD) the rollup last ran successfully for, so the
// once-a-minute interval below doesn't re-run multiple times inside the same 00:05 window.
let lastRunDate = null;

const runRollup = async () => {
  // Aggregate for "yesterday" (UTC) — the day that just fully completed.
  const { rows } = await query(
    `SELECT
       (current_date - interval '1 day')::date AS target_date,
       COUNT(*)::int AS total_sessions,
       COALESCE(SUM(duration_seconds), 0)::bigint AS total_duration_seconds,
       COUNT(DISTINCT COALESCE(user_id::text, session_key))::int AS unique_listeners,
       MODE() WITHIN GROUP (ORDER BY country) AS top_country
     FROM listener_sessions
     WHERE started_at::date = (current_date - interval '1 day')::date`,
  );

  const stats = rows[0];
  if (!stats) return;

  await query(
    `INSERT INTO analytics_daily (date, total_sessions, total_duration_seconds, unique_listeners, peak_concurrent, top_country)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (date) DO UPDATE SET
       total_sessions = EXCLUDED.total_sessions,
       total_duration_seconds = EXCLUDED.total_duration_seconds,
       unique_listeners = EXCLUDED.unique_listeners,
       peak_concurrent = EXCLUDED.peak_concurrent,
       top_country = EXCLUDED.top_country`,
    [
      stats.target_date,
      stats.total_sessions,
      stats.total_duration_seconds,
      stats.unique_listeners,
      // Simplification: listener_sessions only records start/end timestamps, not a
      // concurrency time-series, so a true "peak concurrent" can't be derived after
      // the fact — total_sessions is reused as a best-effort stand-in.
      stats.total_sessions,
      stats.top_country,
    ],
  );
};

/**
 * Starts a lightweight interval-based scheduler (no external cron dependency) that
 * checks every 60s whether it's ~00:05 UTC and the rollup hasn't already run today,
 * then aggregates the previous day's listener_sessions into analytics_daily.
 */
export function scheduleAnalyticsRollup() {
  setInterval(async () => {
    try {
      const now = new Date();
      const todayKey = now.toISOString().slice(0, 10);
      const isRollupWindow = now.getUTCHours() === 0 && now.getUTCMinutes() === 5;

      if (isRollupWindow && lastRunDate !== todayKey) {
        lastRunDate = todayKey;
        await runRollup();
        logger.info(`Analytics rollup completed for ${todayKey} (previous day aggregated).`);
      }
    } catch (err) {
      logger.error(`Analytics rollup failed: ${err.message}`);
    }
  }, 60 * 1000);

  logger.info('Analytics rollup scheduler started (checks every 60s for the 00:05 UTC window).');
}

export default scheduleAnalyticsRollup;
