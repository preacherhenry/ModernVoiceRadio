import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse.js';
import { parseListQuery } from '../utils/pagination.js';
import galleryService from '../services/galleryService.js';

const ALLOWED_SORT = ['display_order', 'created_at', 'event_date'];

export const list = asyncHandler(async (req, res) => {
  const {
    page, limit, offset, sortBy, sortOrder, search,
  } = parseListQuery(req.query, { defaultLimit: 24, allowedSort: ALLOWED_SORT, defaultSort: 'display_order' });

  const { rows, total } = await galleryService.list({
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    mediaType: req.query.media_type || null,
    eventName: req.query.event_name || null,
  });
  sendSuccess(res, 200, 'Gallery items retrieved', rows, buildPaginationMeta(page, limit, total));
});

export const create = asyncHandler(async (req, res) => {
  const item = await galleryService.create(req.body, req.file);
  sendSuccess(res, 201, 'Gallery item created', item);
});

export const remove = asyncHandler(async (req, res) => {
  await galleryService.remove(req.params.id);
  sendSuccess(res, 200, 'Gallery item deleted');
});
