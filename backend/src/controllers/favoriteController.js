import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse.js';
import { parseListQuery } from '../utils/pagination.js';
import favoriteService from '../services/favoriteService.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parseListQuery(req.query, { defaultLimit: 20 });
  const entityType = req.query.entityType || null;

  const { rows, total } = await favoriteService.list({
    userId: req.user.id, entityType, offset, limit,
  });
  sendSuccess(res, 200, 'Favorites retrieved', rows, buildPaginationMeta(page, limit, total));
});

export const add = asyncHandler(async (req, res) => {
  const favorite = await favoriteService.add({
    userId: req.user.id, entityType: req.body.entityType, entityId: req.body.entityId,
  });
  sendSuccess(res, 201, 'Favorite added', favorite);
});

export const remove = asyncHandler(async (req, res) => {
  await favoriteService.remove({
    userId: req.user.id, entityType: req.params.entityType, entityId: req.params.entityId,
  });
  sendSuccess(res, 200, 'Favorite removed');
});

export const check = asyncHandler(async (req, res) => {
  const isFavorited = await favoriteService.check({
    userId: req.user.id, entityType: req.query.entityType, entityId: req.query.entityId,
  });
  sendSuccess(res, 200, 'Favorite status retrieved', { isFavorited });
});
