import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse.js';
import { parseListQuery } from '../utils/pagination.js';
import notificationService from '../services/notificationService.js';

export const create = asyncHandler(async (req, res) => {
  const notification = await notificationService.create({
    title: req.body.title,
    body: req.body.body,
    type: req.body.type,
    imageUrl: req.body.imageUrl,
    data: req.body.data,
    targetTopic: req.body.targetTopic,
    createdBy: req.user.id,
  });
  sendSuccess(res, 201, 'Notification sent', notification);
});

export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parseListQuery(req.query, { defaultLimit: 20 });
  const { rows, total } = await notificationService.list({ offset, limit });
  sendSuccess(res, 200, 'Notifications retrieved', rows, buildPaginationMeta(page, limit, total));
});

export const listMine = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parseListQuery(req.query, { defaultLimit: 20 });
  const { rows, total } = await notificationService.listMine({
    userId: req.user.id, fullName: req.user.fullName, offset, limit,
  });
  sendSuccess(res, 200, 'Notifications retrieved', rows, buildPaginationMeta(page, limit, total));
});

export const markRead = asyncHandler(async (req, res) => {
  const record = await notificationService.markRead({ userId: req.user.id, notificationId: req.params.id });
  sendSuccess(res, 200, 'Notification marked as read', record);
});

export const unreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.unreadCount(req.user.id);
  sendSuccess(res, 200, 'Unread notification count retrieved', { count });
});
