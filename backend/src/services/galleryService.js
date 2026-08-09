import galleryRepository from '../repositories/galleryRepository.js';
import ApiError from '../utils/ApiError.js';

export const galleryService = {
  list: async (listQuery) => galleryRepository.list(listQuery),

  create: async (data, file) => {
    if (!file) throw ApiError.badRequest('A media file is required');
    return galleryRepository.create({
      ...data,
      mediaUrl: file.path,
      mediaPublicId: file.filename,
    });
  },

  remove: async (id) => {
    const existing = await galleryRepository.findById(id);
    if (!existing) throw ApiError.notFound('Gallery item not found');
    await galleryRepository.remove(id);
  },
};

export default galleryService;
