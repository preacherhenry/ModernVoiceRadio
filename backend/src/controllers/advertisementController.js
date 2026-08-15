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

/**
 * Tells every connected app that the advertisement set changed, so carousels and the
 * details gallery refresh without the user reopening the app.
 *
 * Deliberately a signal rather than the advert itself: which adverts a client should see
 * depends on placement, active flag and the station-local date window (see the repository's
 * `active` query), so clients re-ask the server rather than trying to re-implement that.
 */
const broadcastAdvertisementsChanged = (req, reason, adId) => {
  const io = req.app.get('io');
  if (io) io.emit('advertisements_changed', { reason, id: adId ?? null, at: Date.now() });
};

export const create = asyncHandler(async (req, res) => {
  const ad = await advertisementService.create(req.body, req.files);
  broadcastAdvertisementsChanged(req, 'created', ad.id);
  sendSuccess(res, 201, 'Advertisement created', ad);
});

export const update = asyncHandler(async (req, res) => {
  const ad = await advertisementService.update(req.params.id, req.body, req.files);
  broadcastAdvertisementsChanged(req, 'updated', ad.id);
  sendSuccess(res, 200, 'Advertisement updated', ad);
});

export const remove = asyncHandler(async (req, res) => {
  await advertisementService.remove(req.params.id);
  broadcastAdvertisementsChanged(req, 'deleted', req.params.id);
  sendSuccess(res, 200, 'Advertisement deleted');
});
