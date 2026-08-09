import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse.js';
import { parseListQuery } from '../utils/pagination.js';
import programService from '../services/programService.js';

const ALLOWED_SORT = ['title', 'created_at'];

export const list = asyncHandler(async (req, res) => {
  const {
    page, limit, offset, sortBy, sortOrder, search,
  } = parseListQuery(req.query, { defaultLimit: 20, allowedSort: ALLOWED_SORT, defaultSort: 'title' });

  const { rows, total } = await programService.list({
    offset, limit, sortBy, sortOrder, search, category: req.query.category || null,
  });
  sendSuccess(res, 200, 'Programs retrieved', rows, buildPaginationMeta(page, limit, total));
});

export const getOne = asyncHandler(async (req, res) => {
  const program = await programService.getOne(req.params.idOrSlug);
  sendSuccess(res, 200, 'Program retrieved', program);
});

export const create = asyncHandler(async (req, res) => {
  const program = await programService.create(req.body, req.file);
  sendSuccess(res, 201, 'Program created', program);
});

export const update = asyncHandler(async (req, res) => {
  const program = await programService.update(req.params.id, req.body, req.file);
  sendSuccess(res, 200, 'Program updated', program);
});

export const remove = asyncHandler(async (req, res) => {
  await programService.remove(req.params.id);
  sendSuccess(res, 200, 'Program deleted');
});
