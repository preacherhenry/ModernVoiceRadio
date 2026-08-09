import { query } from '../config/database.js';
import { createBaseRepository, idOrSlugColumn } from './baseRepository.js';

const base = createBaseRepository('presenters');

export const presenterRepository = {
  ...base,

  list: async ({
    offset, limit, sortBy, sortOrder, search, featured,
  }) => {
    const conditions = ['is_active = true'];
    const params = [];

    if (typeof featured === 'boolean') {
      params.push(featured);
      conditions.push(`is_featured = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`full_name ILIKE $${params.length}`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const listParams = [...params, limit, offset];
    const { rows } = await query(
      `SELECT * FROM presenters ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams,
    );

    const { rows: countRows } = await query(
      `SELECT COUNT(*)::int AS count FROM presenters ${whereClause}`,
      params,
    );

    return { rows, total: countRows[0].count };
  },

  getPrograms: async (presenterId) => {
    const { rows } = await query(
      `SELECT p.* FROM programs p
       JOIN program_presenters pp ON pp.program_id = p.id
       WHERE pp.presenter_id = $1 AND p.is_active = true
       ORDER BY p.title ASC`,
      [presenterId],
    );
    return rows;
  },

  getPodcasts: async (presenterId) => {
    const { rows } = await query(
      `SELECT * FROM podcasts WHERE presenter_id = $1 AND is_active = true ORDER BY created_at DESC`,
      [presenterId],
    );
    return rows;
  },

  findBySlug: async (slug) => {
    const { rows } = await query('SELECT id FROM presenters WHERE slug = $1', [slug]);
    return rows[0] || null;
  },

  create: async ({
    fullName, slug, photoUrl, photoPublicId, bio, roleTitle, email, phone, socials, isFeatured, displayOrder,
  }) => {
    const { rows } = await query(
      `INSERT INTO presenters
         (full_name, slug, photo_url, photo_public_id, bio, role_title, email, phone, socials, is_featured, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [fullName, slug, photoUrl || null, photoPublicId || null, bio || null, roleTitle || null,
        email || null, phone || null, JSON.stringify(socials || {}), !!isFeatured, displayOrder || 0],
    );
    return rows[0];
  },

  update: async (id, {
    fullName, slug, photoUrl, photoPublicId, bio, roleTitle, email, phone, socials, isFeatured, isActive, displayOrder,
  }) => {
    const { rows } = await query(
      `UPDATE presenters SET
         full_name = COALESCE($2, full_name),
         slug = COALESCE($3, slug),
         photo_url = COALESCE($4, photo_url),
         photo_public_id = COALESCE($5, photo_public_id),
         bio = COALESCE($6, bio),
         role_title = COALESCE($7, role_title),
         email = COALESCE($8, email),
         phone = COALESCE($9, phone),
         socials = COALESCE($10, socials),
         is_featured = COALESCE($11, is_featured),
         is_active = COALESCE($12, is_active),
         display_order = COALESCE($13, display_order)
       WHERE id = $1
       RETURNING *`,
      [id, fullName, slug, photoUrl, photoPublicId, bio, roleTitle, email, phone,
        socials ? JSON.stringify(socials) : null, isFeatured, isActive, displayOrder],
    );
    return rows[0] || null;
  },
};

export { idOrSlugColumn };
export default presenterRepository;
