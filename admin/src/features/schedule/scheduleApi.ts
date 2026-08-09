import { baseApi } from '@api/baseApi';
import type { ApiEnvelope, ScheduleSlot } from '@apptypes/models';

interface ScheduleInput {
  programId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone?: string;
  isActive?: boolean;
}

export const scheduleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWeeklySchedule: builder.query<ApiEnvelope<ScheduleSlot[]>, void>({
      query: () => ({ url: '/schedule/weekly' }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((s) => ({ type: 'Schedule' as const, id: s.id })), { type: 'Schedule' as const, id: 'LIST' }]
        : [{ type: 'Schedule' as const, id: 'LIST' }]),
    }),
    createScheduleSlot: builder.mutation<ApiEnvelope<ScheduleSlot>, ScheduleInput>({
      query: (data) => ({ url: '/schedule', method: 'POST', data }),
      invalidatesTags: [{ type: 'Schedule', id: 'LIST' }],
    }),
    updateScheduleSlot: builder.mutation<ApiEnvelope<ScheduleSlot>, { id: string; data: Partial<ScheduleInput> }>({
      query: ({ id, data }) => ({ url: `/schedule/${id}`, method: 'PUT', data }),
      invalidatesTags: [{ type: 'Schedule', id: 'LIST' }],
    }),
    deleteScheduleSlot: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/schedule/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Schedule', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetWeeklyScheduleQuery, useCreateScheduleSlotMutation, useUpdateScheduleSlotMutation, useDeleteScheduleSlotMutation,
} = scheduleApi;
