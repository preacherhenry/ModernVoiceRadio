import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse.js';
import { parseListQuery } from '../utils/pagination.js';
import chatService from '../services/chatService.js';

export const listMessages = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parseListQuery(req.query, { defaultLimit: 50 });
  const order = req.query.order === 'desc' ? 'desc' : 'asc';
  const { rows, total } = await chatService.listMessages({ offset, limit, order });
  sendSuccess(res, 200, 'Chat messages retrieved', rows, buildPaginationMeta(page, limit, total));
});

export const listPinned = asyncHandler(async (req, res) => {
  const rows = await chatService.listPinned();
  sendSuccess(res, 200, 'Pinned messages retrieved', rows);
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await chatService.deleteMessage(req.params.id, req.user.id);
  sendSuccess(res, 200, 'Message deleted', message);
});

export const pinMessage = asyncHandler(async (req, res) => {
  const message = await chatService.setPinned(req.params.id, req.body.isPinned);
  sendSuccess(res, 200, 'Message pin status updated', message);
});

export const ban = asyncHandler(async (req, res) => {
  const record = await chatService.ban({
    userId: req.body.userId, bannedBy: req.user.id, reason: req.body.reason, expiresAt: req.body.expiresAt,
  });
  sendSuccess(res, 201, 'User banned from chat', record);
});

export const unban = asyncHandler(async (req, res) => {
  await chatService.unban(req.params.userId);
  sendSuccess(res, 200, 'User unbanned from chat');
});

export const getLockState = asyncHandler(async (req, res) => {
  const locked = await chatService.getLockState();
  sendSuccess(res, 200, 'Chat lock state retrieved', { locked });
});

export const setLockState = asyncHandler(async (req, res) => {
  const locked = await chatService.setLockState(req.body.locked);
  const io = req.app.get('io');
  if (io) io.to('chat').emit('chat_lock_changed', { locked });
  sendSuccess(res, 200, 'Chat lock state updated', { locked });
});

/** REST fallback for the admin dashboard to post a message without a socket connection. */
export const sendMessage = asyncHandler(async (req, res) => {
  const saved = await chatService.sendMessageAs(req.user, req.body.message.trim());
  const io = req.app.get('io');
  if (io) io.to('chat').emit('new_message', saved);
  sendSuccess(res, 201, 'Message sent', saved);
});
