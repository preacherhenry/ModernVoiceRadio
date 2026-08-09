import scheduleRepository from '../repositories/scheduleRepository.js';
import programRepository from '../repositories/programRepository.js';
import ApiError from '../utils/ApiError.js';

export const scheduleService = {
  // Returns a flat array (not grouped by day) — both the mobile app's ScheduleScreen
  // and the admin dashboard's SchedulePage already group by day_of_week client-side,
  // which is also friendlier for sorting/filtering than a day-keyed object.
  weekly: async () => scheduleRepository.weekly(),

  today: async () => scheduleRepository.byDay(new Date().getDay()),

  create: async (data) => {
    const program = await programRepository.findById(data.programId);
    if (!program) throw ApiError.badRequest('programId does not reference an existing program');
    return scheduleRepository.create(data);
  },

  update: async (id, data) => {
    const existing = await scheduleRepository.findById(id);
    if (!existing) throw ApiError.notFound('Schedule slot not found');

    if (data.programId) {
      const program = await programRepository.findById(data.programId);
      if (!program) throw ApiError.badRequest('programId does not reference an existing program');
    }

    return scheduleRepository.update(id, data);
  },

  remove: async (id) => {
    const existing = await scheduleRepository.findById(id);
    if (!existing) throw ApiError.notFound('Schedule slot not found');
    await scheduleRepository.remove(id);
  },

  addReminder: async (userId, scheduleId) => {
    const slot = await scheduleRepository.findById(scheduleId);
    if (!slot) throw ApiError.notFound('Schedule slot not found');
    return scheduleRepository.addReminder(userId, scheduleId);
  },

  removeReminder: async (userId, scheduleId) => {
    await scheduleRepository.removeReminder(userId, scheduleId);
  },

  listMyReminders: async (userId) => scheduleRepository.listReminders(userId),
};

export default scheduleService;
