import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse.js';
import { parseListQuery } from '../utils/pagination.js';
import downloadService from '../services/downloadService.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parseListQuery(req.query, { defaultLimit: 20 });
  const { rows, total } = await downloadService.list({ userId: req.user.id, offset, limit });
  sendSuccess(res, 200, 'Downloads retrieved', rows, buildPaginationMeta(page, limit, total));
});

export const add = asyncHandler(async (req, res) => {
  const download = await downloadService.add({
    userId: req.user.id, episodeId: req.body.episodeId, fileSizeBytes: req.body.fileSizeBytes,
  });
  sendSuccess(res, 201, 'Download recorded', download);
});

export const remove = asyncHandler(async (req, res) => {
  await downloadService.remove({ id: req.params.id, userId: req.user.id, roleName: req.user.roleName });
  sendSuccess(res, 200, 'Download removed');
});
