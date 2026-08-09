import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * @param {{ id: string, roleId: string, roleName: string }} payload
 */
export const signAccessToken = (payload) => jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
  expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
});

/**
 * @param {{ id: string }} payload
 */
export const signRefreshToken = (payload) => jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
  expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
});

export const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_ACCESS_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);

/** SHA-256 hash used so raw refresh tokens are never stored at rest. */
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const refreshTokenExpiryDate = () => {
  const days = parseInt((process.env.JWT_REFRESH_EXPIRES_IN || '30d').replace('d', ''), 10) || 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};
