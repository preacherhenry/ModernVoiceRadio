import advertisementRepository from '../repositories/advertisementRepository.js';
import ApiError from '../utils/ApiError.js';

/** An advert may carry at most this many optional supporting pictures. */
export const MAX_SUPPORTING_IMAGES = 4;

const toMediaItems = (files) => files.map((file) => ({
  mediaUrl: file.path,
  mediaPublicId: file.filename,
}));

/** Accepts a JSON array, a repeated form field, or a single id — multipart form data
 *  gives us any of these depending on how many entries the admin removed. */
const parseIdList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== 'string') return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
};

export const advertisementService = {
  list: async (listQuery) => advertisementRepository.list(listQuery),

  active: async (placement) => advertisementRepository.active(placement),

  recordImpression: async (id) => {
    const result = await advertisementRepository.incrementImpression(id);
    if (!result) throw ApiError.notFound('Advertisement not found');
    return result;
  },

  recordClick: async (id) => {
    const result = await advertisementRepository.incrementClick(id);
    if (!result) throw ApiError.notFound('Advertisement not found');
    return result;
  },

  create: async (data, files = {}) => {
    const main = files.image?.[0];
    if (!main) throw ApiError.badRequest('A main poster image is required');

    const supporting = files.supporting ?? [];
    if (supporting.length > MAX_SUPPORTING_IMAGES) {
      throw ApiError.badRequest(`At most ${MAX_SUPPORTING_IMAGES} supporting pictures are allowed`);
    }

    const ad = await advertisementRepository.create({
      ...data,
      imageUrl: main.path,
      imagePublicId: main.filename,
    });

    const media = supporting.length
      ? await advertisementRepository.addMedia(ad.id, toMediaItems(supporting))
      : [];

    return { ...ad, media };
  },

  update: async (id, data, files = {}) => {
    const existing = await advertisementRepository.findById(id);
    if (!existing) throw ApiError.notFound('Advertisement not found');

    const main = files.image?.[0];
    const supporting = files.supporting ?? [];
    const removedIds = parseIdList(data.removedMediaIds);

    // Removals are applied first so an admin can swap pictures in a single save without
    // tripping the cap — e.g. delete two and upload two while already holding four.
    if (removedIds.length) {
      await advertisementRepository.removeMedia(removedIds, id);
    }

    if (supporting.length) {
      const remaining = await advertisementRepository.countMedia(id);
      if (remaining + supporting.length > MAX_SUPPORTING_IMAGES) {
        throw ApiError.badRequest(
          `At most ${MAX_SUPPORTING_IMAGES} supporting pictures are allowed (this advert already has ${remaining})`,
        );
      }
      // Append past the highest existing order, not the row count — those differ once
      // pictures have been removed from the middle of the set.
      const startOrder = await advertisementRepository.nextMediaOrder(id);
      await advertisementRepository.addMedia(id, toMediaItems(supporting), startOrder);
    }

    // `removedMediaIds` is a transport-only field — never let it reach the column updater.
    const { removedMediaIds, ...columns } = data;
    await advertisementRepository.update(id, {
      ...columns,
      imageUrl: main ? main.path : undefined,
      imagePublicId: main ? main.filename : undefined,
    });

    return advertisementRepository.findByIdWithMedia(id);
  },

  remove: async (id) => {
    const existing = await advertisementRepository.findById(id);
    if (!existing) throw ApiError.notFound('Advertisement not found');
    // advertisement_media rows cascade with the advert (see migration 012).
    await advertisementRepository.remove(id);
  },
};

export default advertisementService;
