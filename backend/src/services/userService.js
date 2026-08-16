import bcrypt from 'bcryptjs';
import userRepository from '../repositories/userRepository.js';
import listeningHistoryRepository from '../repositories/listeningHistoryRepository.js';
import ApiError from '../utils/ApiError.js';
import { toPublicUser } from '../utils/publicUser.js';

export const userService = {
  list: async (listQuery) => userRepository.list(listQuery),

  getOne: async (id) => {
    const user = await userRepository.findByIdWithRole(id);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  updateRole: async (id, roleName) => {
    const existing = await userRepository.findByIdWithRole(id);
    if (!existing) throw ApiError.notFound('User not found');

    const role = await userRepository.getRoleByName(roleName);
    if (!role) throw ApiError.badRequest('Unknown role');

    return userRepository.updateRole(id, role.id);
  },

  updateActiveStatus: async (id, isActive) => {
    const existing = await userRepository.findByIdWithRole(id);
    if (!existing) throw ApiError.notFound('User not found');
    return userRepository.updateActiveStatus(id, isActive);
  },

  updateMyProfile: async (userId, data, file) => {
    const updated = await userRepository.updateProfile(userId, {
      fullName: data.fullName,
      phone: data.phone,
      preferredLanguage: data.preferredLanguage,
      themePreference: data.themePreference,
      avatarUrl: file ? file.path : undefined,
      avatarPublicId: file ? file.filename : undefined,
    });
    if (!updated) throw ApiError.notFound('User not found');
    // Re-read with the role joined so the response matches what /auth/me and /auth/login
    // return — clients merge this straight into their stored user.
    const withRole = await userRepository.findByIdWithRole(userId);
    return toPublicUser(withRole ?? updated);
  },

  updateMyPassword: async (userId, currentPassword, newPassword) => {
    const user = await userRepository.findById(userId);
    if (!user || !user.password_hash) {
      throw ApiError.badRequest('Password change is unavailable for this account');
    }

    const matches = await bcrypt.compare(currentPassword, user.password_hash);
    if (!matches) throw ApiError.unauthorized('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await userRepository.updatePassword(userId, passwordHash);
  },

  updateMyFcmToken: async (userId, fcmToken) => {
    await userRepository.updateFcmToken(userId, fcmToken);
  },

  updateMyPushPreference: async (userId, pushEnabled) => {
    await userRepository.updatePushPreference(userId, pushEnabled);
  },

  listMyHistory: async (userId, { offset, limit }) => (
    listeningHistoryRepository.listForUser({ userId, offset, limit })
  ),

  logHistory: async (userId, data) => listeningHistoryRepository.insert({ userId, ...data }),
};

export default userService;
