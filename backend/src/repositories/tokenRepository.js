import { query } from '../config/database.js';

export const tokenRepository = {
  storeRefreshToken: async ({
    userId, tokenHash, userAgent, ipAddress, expiresAt,
  }) => {
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
       VALUES ($1,$2,$3,$4,$5)`,
      [userId, tokenHash, userAgent, ipAddress, expiresAt],
    );
  },

  findActiveByHash: async (tokenHash) => {
    const { rows } = await query(
      `SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`,
      [tokenHash],
    );
    return rows[0] || null;
  },

  revokeByHash: async (tokenHash) => {
    await query('UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1', [tokenHash]);
  },

  revokeAllForUser: async (userId) => {
    await query('UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL', [userId]);
  },

  storePasswordResetOtp: async (userId, otpHash, expiresAt) => {
    await query(
      'INSERT INTO password_resets (user_id, otp_hash, expires_at) VALUES ($1,$2,$3)',
      [userId, otpHash, expiresAt],
    );
  },

  findValidPasswordReset: async (userId, otpHash) => {
    const { rows } = await query(
      `SELECT * FROM password_resets WHERE user_id = $1 AND otp_hash = $2 AND used_at IS NULL AND expires_at > now()
       ORDER BY created_at DESC LIMIT 1`,
      [userId, otpHash],
    );
    return rows[0] || null;
  },

  markPasswordResetUsed: async (id) => {
    await query('UPDATE password_resets SET used_at = now() WHERE id = $1', [id]);
  },
};

export default tokenRepository;
