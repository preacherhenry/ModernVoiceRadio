import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse.js';
import { parseListQuery } from '../utils/pagination.js';
import userService from '../services/userService.js';

const ALLOWED_SORT = ['full_name', 'email', 'created_at'];

export const list = asyncHandler(async (req, res) => {
  const {
    page, limit, offset, sortBy, sortOrder, search,
  } = parseListQuery(req.query, { defaultLimit: 20, allowedSort: ALLOWED_SORT, defaultSort: 'created_at' });

  const { rows, total } = await userService.list({
    offset, limit, sortBy, sortOrder, search,
  });
  sendSuccess(res, 200, 'Users retrieved', rows, buildPaginationMeta(page, limit, total));
});

export const getOne = asyncHandler(async (req, res) => {
  const user = await userService.getOne(req.params.id);
  sendSuccess(res, 200, 'User retrieved', user);
});

export const updateRole = asyncHandler(async (req, res) => {
  const user = await userService.updateRole(req.params.id, req.body.roleName);
  sendSuccess(res, 200, 'User role updated', user);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateActiveStatus(req.params.id, req.body.isActive);
  sendSuccess(res, 200, 'User status updated', user);
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMyProfile(req.user.id, req.body, req.file);
  sendSuccess(res, 200, 'Profile updated', user);
});

export const updateMyPassword = asyncHandler(async (req, res) => {
  await userService.updateMyPassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  sendSuccess(res, 200, 'Password updated successfully');
});

export const updateMyFcmToken = asyncHandler(async (req, res) => {
  await userService.updateMyFcmToken(req.user.id, req.body.fcmToken);
  sendSuccess(res, 200, 'Push token updated');
});

export const updateMyPushPreference = asyncHandler(async (req, res) => {
  await userService.updateMyPushPreference(req.user.id, req.body.pushEnabled);
  sendSuccess(res, 200, 'Push preference updated');
});

export const listMyHistory = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parseListQuery(req.query, { defaultLimit: 20 });
  const { rows, total } = await userService.listMyHistory(req.user.id, { offset, limit });
  sendSuccess(res, 200, 'Listening history retrieved', rows, buildPaginationMeta(page, limit, total));
});

export const logHistory = asyncHandler(async (req, res) => {
  const entry = await userService.logHistory(req.user.id, {
    entityType: req.body.entityType,
    entityId: req.body.entityId,
    durationSeconds: req.body.durationSeconds,
    deviceType: req.body.deviceType,
  });
  sendSuccess(res, 201, 'Listening history recorded', entry);
});
