import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import scheduleService from '../services/scheduleService.js';

export const weekly = asyncHandler(async (req, res) => {
  const week = await scheduleService.weekly();
  sendSuccess(res, 200, 'Weekly schedule retrieved', week);
});

export const today = asyncHandler(async (req, res) => {
  const slots = await scheduleService.today();
  sendSuccess(res, 200, "Today's schedule retrieved", slots);
});

export const create = asyncHandler(async (req, res) => {
  const slot = await scheduleService.create(req.body);
  sendSuccess(res, 201, 'Schedule slot created', slot);
});

export const update = asyncHandler(async (req, res) => {
  const slot = await scheduleService.update(req.params.id, req.body);
  sendSuccess(res, 200, 'Schedule slot updated', slot);
});

export const remove = asyncHandler(async (req, res) => {
  await scheduleService.remove(req.params.id);
  sendSuccess(res, 200, 'Schedule slot deleted');
});

export const addReminder = asyncHandler(async (req, res) => {
  await scheduleService.addReminder(req.user.id, req.params.id);
  sendSuccess(res, 201, 'Reminder set');
});

export const removeReminder = asyncHandler(async (req, res) => {
  await scheduleService.removeReminder(req.user.id, req.params.id);
  sendSuccess(res, 200, 'Reminder removed');
});

export const myReminders = asyncHandler(async (req, res) => {
  const reminders = await scheduleService.listMyReminders(req.user.id);
  sendSuccess(res, 200, 'Your reminders retrieved', reminders);
});
