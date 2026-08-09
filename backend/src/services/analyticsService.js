import analyticsRepository from '../repositories/analyticsRepository.js';
import { getLiveListenerCount } from '../sockets/listenerSocket.js';

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
};

export default analyticsService;
