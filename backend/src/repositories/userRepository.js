import { query } from '../config/database.js';
import { createBaseRepository } from './baseRepository.js';

const base = createBaseRepository('users');

export const userRepository = {
  ...base,

  findByEmail: async (email) => {
    const { rows } = await query(
      `SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = $1`,
      [email],
    );
    return rows[0] || null;
  },

  findByIdWithRole: async (id) => {
    const { rows } = await query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.avatar_url, u.provider, u.is_verified,
              u.preferred_language, u.theme_preference, u.push_enabled, u.created_at,
              r.id AS role_id, r.name AS role_name
       FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = $1`,
      [id],
    );
    return rows[0] || null;
  },

  create: async ({
    roleId, fullName, email, phone, passwordHash, provider = 'local', providerId = null,
  }) => {
    const { rows } = await query(
      `INSERT INTO users (role_id, full_name, email, phone, password_hash, provider, provider_id, is_verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, full_name, email, phone, provider, is_verified, created_at`,
      [roleId, fullName, email, phone, passwordHash, provider, providerId, provider !== 'local'],
    );
    return rows[0];
  },

  updateProfile: async (id, { fullName, phone, avatarUrl, avatarPublicId, preferredLanguage, themePreference }) => {
    const { rows } = await query(
      `UPDATE users SET
         full_name = COALESCE($2, full_name),
         phone = COALESCE($3, phone),
         avatar_url = COALESCE($4, avatar_url),
         avatar_public_id = COALESCE($5, avatar_public_id),
         preferred_language = COALESCE($6, preferred_language),
         theme_preference = COALESCE($7, theme_preference)
       WHERE id = $1
       RETURNING id, full_name, email, phone, avatar_url, preferred_language, theme_preference`,
      [id, fullName, phone, avatarUrl, avatarPublicId, preferredLanguage, themePreference],
    );
    return rows[0];
  },

  updatePassword: async (id, passwordHash) => {
    await query('UPDATE users SET password_hash = $2 WHERE id = $1', [id, passwordHash]);
  },

  updateFcmToken: async (id, fcmToken) => {
    await query('UPDATE users SET fcm_token = $2 WHERE id = $1', [id, fcmToken]);
  },

  touchLastLogin: async (id) => {
    await query('UPDATE users SET last_login_at = now() WHERE id = $1', [id]);
  },

  getRoleByName: async (name) => {
    const { rows } = await query('SELECT id, name FROM roles WHERE name = $1', [name]);
    return rows[0] || null;
  },

  updateRole: async (id, roleId) => {
    const { rows } = await query(
      `UPDATE users SET role_id = $2 WHERE id = $1
       RETURNING id, full_name, email, role_id`,
      [id, roleId],
    );
    return rows[0] || null;
  },

  updateActiveStatus: async (id, isActive) => {
    const { rows } = await query(
      `UPDATE users SET is_active = $2 WHERE id = $1
       RETURNING id, full_name, email, is_active`,
      [id, isActive],
    );
    return rows[0] || null;
  },

  updatePushPreference: async (id, pushEnabled) => {
    await query('UPDATE users SET push_enabled = $2 WHERE id = $1', [id, pushEnabled]);
  },

  list: async ({
    offset, limit, sortBy, sortOrder, search,
  }) => {
    const params = [limit, offset];
    let searchClause = '';
    if (search) {
      params.push(`%${search}%`);
      searchClause = `WHERE u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length}`;
    }
    const { rows } = await query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.is_verified, u.created_at, r.name AS role_name
       FROM users u JOIN roles r ON r.id = u.role_id
       ${searchClause}
       ORDER BY u.${sortBy} ${sortOrder}
       LIMIT $1 OFFSET $2`,
      params,
    );
    const countParams = search ? [`%${search}%`] : [];
    const { rows: countRows } = await query(
      `SELECT COUNT(*)::int AS count FROM users u ${search ? 'WHERE u.full_name ILIKE $1 OR u.email ILIKE $1' : ''}`,
      countParams,
    );
    return { rows, total: countRows[0].count };
  },
};

export default userRepository;
