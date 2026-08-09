import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse.js';
import { parseListQuery } from '../utils/pagination.js';
import newsService from '../services/newsService.js';

const ALLOWED_SORT = ['published_at', 'created_at', 'view_count', 'title'];

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await newsService.listCategories();
  sendSuccess(res, 200, 'News categories retrieved', categories);
});

export const list = asyncHandler(async (req, res) => {
  const {
    page, limit, offset, sortBy, sortOrder, search,
  } = parseListQuery(req.query, { defaultLimit: 20, allowedSort: ALLOWED_SORT, defaultSort: 'published_at' });

  let breaking;
  if (req.query.breaking === 'true') breaking = true;
  else if (req.query.breaking === 'false') breaking = false;

  let trending;
  if (req.query.trending === 'true') trending = true;
  else if (req.query.trending === 'false') trending = false;

  const { rows, total } = await newsService.list({
    offset, limit, sortBy, sortOrder, search, categoryId: req.query.category_id || null, breaking, trending,
  }, req.user);
  sendSuccess(res, 200, 'News retrieved', rows, buildPaginationMeta(page, limit, total));
});

export const getOne = asyncHandler(async (req, res) => {
  const article = await newsService.getOne(req.params.idOrSlug, req.user);
  sendSuccess(res, 200, 'News article retrieved', article);
});

export const create = asyncHandler(async (req, res) => {
  const article = await newsService.create(req.body, req.user.id, req.files);
  sendSuccess(res, 201, 'News article created', article);
});

export const update = asyncHandler(async (req, res) => {
  const article = await newsService.update(req.params.id, req.body, req.files);
  sendSuccess(res, 200, 'News article updated', article);
});

export const removeMedia = asyncHandler(async (req, res) => {
  await newsService.removeMedia(req.params.id, req.params.mediaId);
  sendSuccess(res, 200, 'Media item removed');
});

export const remove = asyncHandler(async (req, res) => {
  await newsService.remove(req.params.id);
  sendSuccess(res, 200, 'News article deleted');
});
