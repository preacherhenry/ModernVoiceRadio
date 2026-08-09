import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse.js';
import { parseListQuery } from '../utils/pagination.js';
import podcastService from '../services/podcastService.js';

const ALLOWED_SORT = ['title', 'created_at'];

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await podcastService.listCategories();
  sendSuccess(res, 200, 'Podcast categories retrieved', categories);
});

export const list = asyncHandler(async (req, res) => {
  const {
    page, limit, offset, sortBy, sortOrder, search,
  } = parseListQuery(req.query, { defaultLimit: 20, allowedSort: ALLOWED_SORT, defaultSort: 'created_at' });

  let featured;
  if (req.query.featured === 'true') featured = true;
  else if (req.query.featured === 'false') featured = false;

  const { rows, total } = await podcastService.list({
    offset, limit, sortBy, sortOrder, search, categoryId: req.query.category_id || null, featured,
  });
  sendSuccess(res, 200, 'Podcasts retrieved', rows, buildPaginationMeta(page, limit, total));
});

export const getOne = asyncHandler(async (req, res) => {
  const podcast = await podcastService.getOne(req.params.idOrSlug);
  sendSuccess(res, 200, 'Podcast retrieved', podcast);
});

export const create = asyncHandler(async (req, res) => {
  const podcast = await podcastService.create(req.body, req.file);
  sendSuccess(res, 201, 'Podcast created', podcast);
});

export const update = asyncHandler(async (req, res) => {
  const podcast = await podcastService.update(req.params.id, req.body, req.file);
  sendSuccess(res, 200, 'Podcast updated', podcast);
});

export const remove = asyncHandler(async (req, res) => {
  await podcastService.remove(req.params.id);
  sendSuccess(res, 200, 'Podcast deleted');
});

// --- Episodes --------------------------------------------------------------

export const listEpisodes = asyncHandler(async (req, res) => {
  const episodes = await podcastService.listEpisodes(req.params.podcastId);
  sendSuccess(res, 200, 'Episodes retrieved', episodes);
});

export const createEpisode = asyncHandler(async (req, res) => {
  const episode = await podcastService.createEpisode(req.params.podcastId, req.body, req.files);
  sendSuccess(res, 201, 'Episode created', episode);
});

export const updateEpisode = asyncHandler(async (req, res) => {
  const episode = await podcastService.updateEpisode(req.params.id, req.body, req.files);
  sendSuccess(res, 200, 'Episode updated', episode);
});

export const removeEpisode = asyncHandler(async (req, res) => {
  await podcastService.removeEpisode(req.params.id);
  sendSuccess(res, 200, 'Episode deleted');
});

export const playEpisode = asyncHandler(async (req, res) => {
  const result = await podcastService.playEpisode(req.params.id);
  sendSuccess(res, 200, 'Play recorded', result);
});

// --- Progress ----------------------------------------------------------------

export const updateProgress = asyncHandler(async (req, res) => {
  const progress = await podcastService.updateProgress(
    req.user.id,
    req.params.id,
    req.body.positionSeconds,
    req.body.isCompleted,
  );
  sendSuccess(res, 200, 'Progress saved', progress);
});

export const continueListening = asyncHandler(async (req, res) => {
  const rows = await podcastService.continueListening(req.user.id);
  sendSuccess(res, 200, 'Continue listening retrieved', rows);
});
