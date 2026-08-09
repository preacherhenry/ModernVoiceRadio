import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse.js';
import { parseListQuery } from '../utils/pagination.js';
import advertisementService from '../services/advertisementService.js';

const ALLOWED_SORT = ['display_order', 'created_at'];

export const active = asyncHandler(async (req, res) => {
  const ads = await advertisementService.active(req.query.placement || null);
  sendSuccess(res, 200, 'Active advertisements retrieved', ads);
});

export const impression = asyncHandler(async (req, res) => {
  const result = await advertisementService.recordImpression(req.params.id);
  sendSuccess(res, 200, 'Impression recorded', result);
});

export const click = asyncHandler(async (req, res) => {
  const result = await advertisementService.recordClick(req.params.id);
  sendSuccess(res, 200, 'Click recorded', result);
});

export const list = asyncHandler(async (req, res) => {
  const {
    page, limit, offset, sortBy, sortOrder, search,
  } = parseListQuery(req.query, { defaultLimit: 20, allowedSort: ALLOWED_SORT, defaultSort: 'display_order' });

  const { rows, total } = await advertisementService.list({
    offset, limit, sortBy, sortOrder, search, placement: req.query.placement || null,
  });
  sendSuccess(res, 200, 'Advertisements retrieved', rows, buildPaginationMeta(page, limit, total));
});

export const create = asyncHandler(async (req, res) => {
  const ad = await advertisementService.create(req.body, req.file);
  sendSuccess(res, 201, 'Advertisement created', ad);
});

export const update = asyncHandler(async (req, res) => {
  const ad = await advertisementService.update(req.params.id, req.body, req.file);
  sendSuccess(res, 200, 'Advertisement updated', ad);
});

export const remove = asyncHandler(async (req, res) => {
  await advertisementService.remove(req.params.id);
  sendSuccess(res, 200, 'Advertisement deleted');
});
