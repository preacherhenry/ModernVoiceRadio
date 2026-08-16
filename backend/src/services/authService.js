import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import userRepository from '../repositories/userRepository.js';
import tokenRepository from '../repositories/tokenRepository.js';
import ApiError from '../utils/ApiError.js';
import { CURRENT_TERMS_VERSION } from '../constants/legal.js';
import {
  signAccessToken, signRefreshToken, verifyRefreshToken, hashToken, refreshTokenExpiryDate,
} from '../utils/jwt.js';
import { toPublicUser } from '../utils/publicUser.js';


const issueTokenPair = async (user, meta = {}) => {
  const accessToken = signAccessToken({ id: user.id, roleId: user.role_id, roleName: user.role_name });
  const refreshToken = signRefreshToken({ id: user.id });
  await tokenRepository.storeRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    userAgent: meta.userAgent || null,
    ipAddress: meta.ipAddress || null,
    expiresAt: refreshTokenExpiryDate(),
  });
  return { accessToken, refreshToken };
};

export const authService = {
  register: async ({
    fullName, email, phone, password, acceptedTerms,
  }, meta) => {
    // Enforced server-side as well as in the app: the checkbox is a convenience, this
    // is the record that matters.
    if (!acceptedTerms) {
      throw ApiError.badRequest('You must accept the Terms & Conditions to create an account');
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const listenerRole = await userRepository.getRoleByName('listener');
    if (!listenerRole) throw ApiError.internal('Default role not configured — run database seeds');

    const passwordHash = await bcrypt.hash(password, 12);
    const created = await userRepository.create({
      roleId: listenerRole.id, fullName, email, phone, passwordHash,
      termsVersion: CURRENT_TERMS_VERSION,
    });

    const fullUser = await userRepository.findByEmail(email);
    const tokens = await issueTokenPair(fullUser, meta);
    return { user: toPublicUser({ ...fullUser, ...created }), ...tokens };
  },

  login: async ({ email, password }, meta) => {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.password_hash) throw ApiError.unauthorized('Invalid email or password');

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) throw ApiError.unauthorized('Invalid email or password');
    if (!user.is_active) throw ApiError.forbidden('This account has been deactivated');

    await userRepository.touchLastLogin(user.id);
    const tokens = await issueTokenPair(user, meta);
    return { user: toPublicUser(user), ...tokens };
  },

  refresh: async (refreshToken, meta) => {
    if (!refreshToken) throw ApiError.unauthorized('Missing refresh token');

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await tokenRepository.findActiveByHash(tokenHash);
    if (!stored) throw ApiError.unauthorized('Refresh token has been revoked');

    const user = await userRepository.findByIdWithRole(decoded.id);
    if (!user) throw ApiError.unauthorized('Account no longer exists');

    // rotate: revoke old, issue new pair
    await tokenRepository.revokeByHash(tokenHash);
    const tokens = await issueTokenPair({ id: user.id, role_id: user.role_id, role_name: user.role_name }, meta);
    return tokens;
  },

  logout: async (refreshToken) => {
    if (!refreshToken) return;
    await tokenRepository.revokeByHash(hashToken(refreshToken));
  },

  me: async (userId) => {
    const user = await userRepository.findByIdWithRole(userId);
    if (!user) throw ApiError.notFound('User not found');
    // Same base shape as everywhere else, plus the two fields only this endpoint exposes.
    return {
      ...toPublicUser(user),
      pushEnabled: user.push_enabled,
      createdAt: user.created_at,
    };
  },

  forgotPassword: async (email) => {
    const user = await userRepository.findByEmail(email);
    // Always resolve silently — never reveal whether an email is registered.
    if (!user) return { otp: null };

    const otp = String(crypto.randomInt(100000, 999999));
    const otpHash = hashToken(otp);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await tokenRepository.storePasswordResetOtp(user.id, otpHash, expiresAt);

    // NOTE: wire this into an email/SMS provider (e.g. SendGrid, Twilio) in production.
    return { otp, userId: user.id };
  },

  resetPassword: async ({ email, otp, newPassword }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw ApiError.badRequest('Invalid or expired code');

    const record = await tokenRepository.findValidPasswordReset(user.id, hashToken(otp));
    if (!record) throw ApiError.badRequest('Invalid or expired code');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await userRepository.updatePassword(user.id, passwordHash);
    await tokenRepository.markPasswordResetUsed(record.id);
    await tokenRepository.revokeAllForUser(user.id);
  },
};

export default authService;
