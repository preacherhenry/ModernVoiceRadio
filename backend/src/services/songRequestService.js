import songRequestRepository from '../repositories/songRequestRepository.js';
import ApiError from '../utils/ApiError.js';

export const songRequestService = {
  create: async ({
    userId, requesterName, songTitle, artistName, message,
  }) => songRequestRepository.create({
    userId, requesterName, songTitle, artistName, message,
  }),

  list: async ({ offset, limit, status }) => songRequestRepository.list({ offset, limit, status }),

  updateStatus: async (id, status) => {
    const existing = await songRequestRepository.findById(id);
    if (!existing) throw ApiError.notFound('Song request not found');
    return songRequestRepository.updateStatus(id, status);
  },
};

export default songRequestService;
