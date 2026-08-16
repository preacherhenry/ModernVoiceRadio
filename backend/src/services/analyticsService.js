import analyticsRepository from '../repositories/analyticsRepository.js';
import { getLiveListenerCount, MIN_MEANINGFUL_SESSION_SECONDS } from '../sockets/listenerSocket.js';

/**
 * Turns a period selection into a concrete date window in the station's timezone.
 * Dates are plain 'YYYY-MM-DD' strings compared against the local date of each session,
 * so a window means whole Zambian days rather than UTC instants.
 */
/** Today's calendar date in the station's timezone, as 'YYYY-MM-DD'. */
const stationToday = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: analyticsRepository.STATION_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

/** Shifts a 'YYYY-MM-DD' string by whole days, staying on the calendar (no clock, no zone). */
const shiftDays = (isoDate, delta) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + delta));
  const pad = (n) => String(n).padStart(2, '0');
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
};

export const resolvePeriod = ({ period = 'all', from, to } = {}) => {
  if (period === 'custom') return { from: from || null, to: to || null, period };

  const days = { today: 1, '7d': 7, '30d': 30 }[period];
  if (!days) return { from: null, to: null, period: 'all' };

  // Arithmetic on the local calendar date, not on a timestamp: converting a formatted
  // local string back into a Date is not reliably parseable and produced Invalid Date.
  const today = stationToday();
  return { from: shiftDays(today, -(days - 1)), to: today, period };
};

export const analyticsService = {
  overview: async (io) => {
    const today = await analyticsRepository.todayStats();
    const liveListeners = io ? getLiveListenerCount(io) : 0;

    return {
      liveListeners,
      todaySessions: today.today_sessions,
      todayUniqueListeners: today.today_unique_listeners,
      todayTotalDurationSeconds: Number(today.today_total_duration_seconds),
    };
  },

  countries: async () => analyticsRepository.byCountry(),
  cities: async () => analyticsRepository.byCity(),
  devices: async () => analyticsRepository.byDevice(),
  trend: async (days) => analyticsRepository.trend(days),

  /** Headline listener figures plus the single most active listener for the period. */
  listenerSummary: async (periodQuery) => {
    const { from, to, period } = resolvePeriod(periodQuery);
    const minSeconds = MIN_MEANINGFUL_SESSION_SECONDS;

    const [summary, topList] = await Promise.all([
      analyticsRepository.listenerSummary({ from, to, minSeconds }),
      analyticsRepository.listenerBreakdown({
        from, to, minSeconds, sortBy: 'total_seconds', limit: 1, offset: 0,
      }),
    ]);

    const uniqueListeners = summary.unique_listeners;
    const returning = summary.returning_listeners;
    const top = topList.rows[0] || null;

    return {
      period,
      from,
      to,
      uniqueListeners,
      totalSeconds: Number(summary.total_seconds),
      averageSessionSeconds: summary.average_session_seconds,
      returningListeners: returning,
      // Share of this period's listeners who came back on another day, not a share of
      // all registered users — 0 listeners means 0%, never a division by zero.
      returningPercentage: uniqueListeners ? Math.round((returning / uniqueListeners) * 100) : 0,
      mostActiveListener: top && {
        userId: top.user_id,
        fullName: top.full_name,
        email: top.email,
        avatarUrl: top.avatar_url,
        totalSeconds: Number(top.total_seconds),
      },
    };
  },

  /** The dashboard's listener table. */
  listenerBreakdown: async ({ sortBy, limit, offset, ...periodQuery }) => {
    const { from, to } = resolvePeriod(periodQuery);
    const { rows, total } = await analyticsRepository.listenerBreakdown({
      from, to, minSeconds: MIN_MEANINGFUL_SESSION_SECONDS, sortBy, limit, offset,
    });
    return {
      rows: rows.map((r) => ({
        userId: r.user_id,
        fullName: r.full_name,
        email: r.email,
        avatarUrl: r.avatar_url,
        totalSeconds: Number(r.total_seconds),
        sessionCount: r.session_count,
        activeDays: r.active_days,
        lastListenedAt: r.last_listened_at,
      })),
      total,
    };
  },

  /** One listener's full session history. */
  listenerHistory: async ({ userId, limit, offset, ...periodQuery }) => {
    const { from, to } = resolvePeriod(periodQuery);
    const { user, totals, sessions } = await analyticsRepository.listenerHistory({
      userId, from, to, minSeconds: MIN_MEANINGFUL_SESSION_SECONDS, limit, offset,
    });
    return {
      user: user && {
        id: user.id, fullName: user.full_name, email: user.email, avatarUrl: user.avatar_url,
      },
      totalSeconds: Number(totals.total_seconds),
      sessionCount: totals.session_count,
      activeDays: totals.active_days,
      firstListenedAt: totals.first_listened_at,
      lastListenedAt: totals.last_listened_at,
      sessions: sessions.map((s) => ({
        id: s.id,
        startedAt: s.started_at,
        endedAt: s.ended_at,
        durationSeconds: s.duration_seconds,
        deviceType: s.device_type,
      })),
    };
  },
};

export default analyticsService;
