import { query } from '../config/database.js';
import { createBaseRepository } from './baseRepository.js';

const base = createBaseRepository('programs');

export const programRepository = {
  ...base,

  list: async ({
    offset, limit, sortBy, sortOrder, search, category,
  }) => {
    const conditions = ['is_active = true'];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`title ILIKE $${params.length}`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const listParams = [...params, limit, offset];
    const { rows } = await query(
      `SELECT * FROM programs ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams,
    );

    const { rows: countRows } = await query(
      `SELECT COUNT(*)::int AS count FROM programs ${whereClause}`,
      params,
    );

    return { rows, total: countRows[0].count };
  },

  getPresenters: async (programId) => {
    const { rows } = await query(
      `SELECT pr.* FROM presenters pr
       JOIN program_presenters pp ON pp.presenter_id = pr.id
       WHERE pp.program_id = $1 AND pr.is_active = true
       ORDER BY pr.full_name ASC`,
      [programId],
    );
    return rows;
  },

  getSchedule: async (programId) => {
    const { rows } = await query(
      `SELECT * FROM schedule WHERE program_id = $1 AND is_active = true
       ORDER BY day_of_week ASC, start_time ASC`,
      [programId],
    );
    return rows;
  },

  findBySlug: async (slug) => {
    const { rows } = await query('SELECT id FROM programs WHERE slug = $1', [slug]);
    return rows[0] || null;
  },

  setPresenters: async (programId, presenterIds) => {
    await query('DELETE FROM program_presenters WHERE program_id = $1', [programId]);
    if (!presenterIds || !presenterIds.length) return;
    const values = presenterIds.map((_, i) => `($1, $${i + 2})`).join(', ');
    await query(
      `INSERT INTO program_presenters (program_id, presenter_id) VALUES ${values} ON CONFLICT DO NOTHING`,
      [programId, ...presenterIds],
    );
  },

  create: async ({
    title, slug, description, coverImageUrl, coverPublicId, category,
  }) => {
    const { rows } = await query(
      `INSERT INTO programs (title, slug, description, cover_image_url, cover_public_id, category)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [title, slug, description || null, coverImageUrl || null, coverPublicId || null, category || null],
    );
    return rows[0];
  },

  update: async (id, {
    title, slug, description, coverImageUrl, coverPublicId, category, isActive,
  }) => {
    const { rows } = await query(
      `UPDATE programs SET
         title = COALESCE($2, title),
         slug = COALESCE($3, slug),
         description = COALESCE($4, description),
         cover_image_url = COALESCE($5, cover_image_url),
         cover_public_id = COALESCE($6, cover_public_id),
         category = COALESCE($7, category),
         is_active = COALESCE($8, is_active)
       WHERE id = $1
       RETURNING *`,
      [id, title, slug, description, coverImageUrl, coverPublicId, category, isActive],
    );
    return rows[0] || null;
  },
};

export default programRepository;
