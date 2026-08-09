import { baseApi } from './baseApi';
import type { ApiEnvelope, ScheduleSlot } from '@apptypes/models';

export const scheduleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWeeklySchedule: builder.query<ApiEnvelope<ScheduleSlot[]>, void>({
      query: () => ({ url: '/schedule/weekly' }),
      providesTags: [{ type: 'Schedule', id: 'WEEKLY' }],
    }),
    getTodaySchedule: builder.query<ApiEnvelope<ScheduleSlot[]>, void>({
      query: () => ({ url: '/schedule/today' }),
      providesTags: [{ type: 'Schedule', id: 'TODAY' }],
    }),
    getMyReminders: builder.query<ApiEnvelope<ScheduleSlot[]>, void>({
      query: () => ({ url: '/schedule/reminders/mine' }),
      providesTags: [{ type: 'Reminder', id: 'LIST' }],
    }),
    setReminder: builder.mutation<ApiEnvelope<null>, string>({
      query: (scheduleId) => ({ url: `/schedule/${scheduleId}/reminder`, method: 'POST' }),
      invalidatesTags: [{ type: 'Reminder', id: 'LIST' }],
    }),
    removeReminder: builder.mutation<ApiEnvelope<null>, string>({
      query: (scheduleId) => ({ url: `/schedule/${scheduleId}/reminder`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Reminder', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetWeeklyScheduleQuery, useGetTodayScheduleQuery, useGetMyRemindersQuery,
  useSetReminderMutation, useRemoveReminderMutation,
} = scheduleApi;
