import advertisementRepository from '../repositories/advertisementRepository.js';
import ApiError from '../utils/ApiError.js';

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

  create: async (data, file) => {
    if (!file) throw ApiError.badRequest('An image file is required');
    return advertisementRepository.create({
      ...data,
      imageUrl: file.path,
      imagePublicId: file.filename,
    });
  },

  update: async (id, data, file) => {
    const existing = await advertisementRepository.findById(id);
    if (!existing) throw ApiError.notFound('Advertisement not found');

    return advertisementRepository.update(id, {
      ...data,
      imageUrl: file ? file.path : undefined,
      imagePublicId: file ? file.filename : undefined,
    });
  },

  remove: async (id) => {
    const existing = await advertisementRepository.findById(id);
    if (!existing) throw ApiError.notFound('Advertisement not found');
    await advertisementRepository.remove(id);
  },
};

export default advertisementService;
