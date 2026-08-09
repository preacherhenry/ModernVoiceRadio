import downloadRepository from '../repositories/downloadRepository.js';
import ApiError from '../utils/ApiError.js';

export const downloadService = {
  list: async ({ userId, offset, limit }) => downloadRepository.list({ userId, offset, limit }),

  add: async ({ userId, episodeId, fileSizeBytes }) => (
    downloadRepository.upsert({ userId, episodeId, fileSizeBytes })
  ),

  remove: async ({ id, userId, roleName }) => {
    const existing = await downloadRepository.findById(id);
    if (!existing) throw ApiError.notFound('Download not found');

    const isOwner = existing.user_id === userId;
    const isAdmin = roleName === 'admin' || roleName === 'super_admin';
    if (!isOwner && !isAdmin) throw ApiError.forbidden('You do not have permission to remove this download');

    await downloadRepository.remove(id);
  },
};

export default downloadService;
