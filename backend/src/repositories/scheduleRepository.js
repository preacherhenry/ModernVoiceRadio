import { query } from '../config/database.js';
import { createBaseRepository } from './baseRepository.js';

const base = createBaseRepository('schedule');

const WEEKLY_SELECT = `
  SELECT s.*, p.title AS program_title, p.slug AS program_slug, p.cover_image_url AS program_cover,
    COALESCE(STRING_AGG(DISTINCT pr.full_name, ', '), '') AS presenter_names
  FROM schedule s
  JOIN programs p ON p.id = s.program_id
  LEFT JOIN program_presenters pp ON pp.program_id = p.id
  LEFT JOIN presenters pr ON pr.id = pp.presenter_id
`;

export const scheduleRepository = {
  ...base,

  weekly: async () => {
    const { rows } = await query(
      `${WEEKLY_SELECT}
       WHERE s.is_active = true
       GROUP BY s.id, p.title, p.slug, p.cover_image_url
       ORDER BY s.day_of_week ASC, s.start_time ASC`,
    );
    return rows;
  },

  byDay: async (dayOfWeek) => {
    const { rows } = await query(
      `${WEEKLY_SELECT}
       WHERE s.is_active = true AND s.day_of_week = $1
       GROUP BY s.id, p.title, p.slug, p.cover_image_url
       ORDER BY s.start_time ASC`,
      [dayOfWeek],
    );
    return rows;
  },

  create: async ({
    programId, dayOfWeek, startTime, endTime, timezone,
  }) => {
    const { rows } = await query(
      `INSERT INTO schedule (program_id, day_of_week, start_time, end_time, timezone)
       VALUES ($1,$2,$3,$4,COALESCE($5,'UTC'))
       RETURNING *`,
      [programId, dayOfWeek, startTime, endTime, timezone || null],
    );
    return rows[0];
  },

  update: async (id, {
    programId, dayOfWeek, startTime, endTime, timezone, isActive,
  }) => {
    const { rows } = await query(
      `UPDATE schedule SET
         program_id = COALESCE($2, program_id),
         day_of_week = COALESCE($3, day_of_week),
         start_time = COALESCE($4, start_time),
         end_time = COALESCE($5, end_time),
         timezone = COALESCE($6, timezone),
         is_active = COALESCE($7, is_active)
       WHERE id = $1
       RETURNING *`,
      [id, programId, dayOfWeek, startTime, endTime, timezone, isActive],
    );
    return rows[0] || null;
  },

  addReminder: async (userId, scheduleId) => {
    const { rows } = await query(
      `INSERT INTO schedule_reminders (user_id, schedule_id) VALUES ($1,$2)
       ON CONFLICT (user_id, schedule_id) DO NOTHING
       RETURNING *`,
      [userId, scheduleId],
    );
    return rows[0] || null;
  },

  removeReminder: async (userId, scheduleId) => {
    const { rowCount } = await query(
      'DELETE FROM schedule_reminders WHERE user_id = $1 AND schedule_id = $2',
      [userId, scheduleId],
    );
    return rowCount > 0;
  },

  listReminders: async (userId) => {
    const { rows } = await query(
      `SELECT sr.id, sr.created_at, s.id AS schedule_id, s.day_of_week, s.start_time, s.end_time,
              p.id AS program_id, p.title AS program_title, p.slug AS program_slug, p.cover_image_url AS program_cover
       FROM schedule_reminders sr
       JOIN schedule s ON s.id = sr.schedule_id
       JOIN programs p ON p.id = s.program_id
       WHERE sr.user_id = $1
       ORDER BY s.day_of_week ASC, s.start_time ASC`,
      [userId],
    );
    return rows;
  },
};

export default scheduleRepository;
