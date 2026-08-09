import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse.js';
import { parseListQuery } from '../utils/pagination.js';
import presenterService from '../services/presenterService.js';

const ALLOWED_SORT = ['full_name', 'display_order', 'created_at'];

export const list = asyncHandler(async (req, res) => {
  const {
    page, limit, offset, sortBy, sortOrder, search,
  } = parseListQuery(req.query, { defaultLimit: 20, allowedSort: ALLOWED_SORT, defaultSort: 'display_order' });

  let featured;
  if (req.query.featured === 'true') featured = true;
  else if (req.query.featured === 'false') featured = false;

  const { rows, total } = await presenterService.list({
    offset, limit, sortBy, sortOrder, search, featured,
  });
  sendSuccess(res, 200, 'Presenters retrieved', rows, buildPaginationMeta(page, limit, total));
});

export const getOne = asyncHandler(async (req, res) => {
  const presenter = await presenterService.getOne(req.params.idOrSlug);
  sendSuccess(res, 200, 'Presenter retrieved', presenter);
});

export const create = asyncHandler(async (req, res) => {
  const presenter = await presenterService.create(req.body, req.file);
  sendSuccess(res, 201, 'Presenter created', presenter);
});

export const update = asyncHandler(async (req, res) => {
  const presenter = await presenterService.update(req.params.id, req.body, req.file);
  sendSuccess(res, 200, 'Presenter updated', presenter);
});

export const remove = asyncHandler(async (req, res) => {
  await presenterService.remove(req.params.id);
  sendSuccess(res, 200, 'Presenter deleted');
});
