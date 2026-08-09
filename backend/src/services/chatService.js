import chatRepository from '../repositories/chatRepository.js';
import settingsRepository from '../repositories/settingsRepository.js';
import ApiError from '../utils/ApiError.js';

const CHAT_LOCK_KEY = 'chat_locked';

export const chatService = {
  listMessages: async ({ offset, limit, order }) => chatRepository.listMessages({ offset, limit, order }),

  listPinned: async () => chatRepository.listPinned(),

  getLockState: async () => {
    const row = await settingsRepository.findByKey(CHAT_LOCK_KEY);
    return !!(row && row.value && row.value.locked);
  },

  setLockState: async (locked) => {
    await settingsRepository.upsert(
      CHAT_LOCK_KEY,
      { locked: !!locked },
      'Whether the live chat is locked — when true, only moderators/admins can send messages.',
    );
    return !!locked;
  },

  /** Used by the admin dashboard's REST "post a comment" flow (moderators/admins only). */
  sendMessageAs: async (user, message) => chatRepository.insertMessage({
    userId: user.id,
    displayName: user.fullName,
    avatarUrl: null,
    message,
    replyToId: null,
    isAnnouncement: false,
  }),

  deleteMessage: async (id, deletedBy) => {
    const existing = await chatRepository.findById(id);
    if (!existing) throw ApiError.notFound('Message not found');
    return chatRepository.softDelete(id, deletedBy);
  },

  setPinned: async (id, isPinned) => {
    const existing = await chatRepository.findById(id);
    if (!existing) throw ApiError.notFound('Message not found');
    return chatRepository.setPinned(id, isPinned);
  },

  ban: async ({
    userId, bannedBy, reason, expiresAt,
  }) => chatRepository.upsertBan({
    userId, bannedBy, reason, expiresAt,
  }),

  unban: async (userId) => {
    const removed = await chatRepository.removeBan(userId);
    if (!removed) throw ApiError.notFound('Ban not found for this user');
  },
};

export default chatService;
