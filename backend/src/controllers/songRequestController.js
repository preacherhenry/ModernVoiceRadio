import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse.js';
import { parseListQuery } from '../utils/pagination.js';
import songRequestService from '../services/songRequestService.js';

export const create = asyncHandler(async (req, res) => {
  const request = await songRequestService.create({
    userId: req.user ? req.user.id : null,
    requesterName: req.body.requesterName,
    songTitle: req.body.songTitle,
    artistName: req.body.artistName,
    message: req.body.message,
  });
  sendSuccess(res, 201, 'Song request submitted', request);
});

export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parseListQuery(req.query, { defaultLimit: 20 });
  const { rows, total } = await songRequestService.list({
    offset, limit, status: req.query.status || null,
  });
  sendSuccess(res, 200, 'Song requests retrieved', rows, buildPaginationMeta(page, limit, total));
});

export const updateStatus = asyncHandler(async (req, res) => {
  const request = await songRequestService.updateStatus(req.params.id, req.body.status);
  sendSuccess(res, 200, 'Song request status updated', request);
});
