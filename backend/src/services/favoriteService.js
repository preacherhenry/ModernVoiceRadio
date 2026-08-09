import favoriteRepository from '../repositories/favoriteRepository.js';

export const favoriteService = {
  list: async ({
    userId, entityType, offset, limit,
  }) => favoriteRepository.list({
    userId, entityType, offset, limit,
  }),

  add: async ({ userId, entityType, entityId }) => favoriteRepository.add({ userId, entityType, entityId }),

  remove: async ({ userId, entityType, entityId }) => favoriteRepository.remove({ userId, entityType, entityId }),

  check: async ({ userId, entityType, entityId }) => favoriteRepository.exists({ userId, entityType, entityId }),
};

export default favoriteService;
