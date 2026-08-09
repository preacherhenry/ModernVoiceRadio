import { query } from '../config/database.js';
import { createBaseRepository, idOrSlugColumn } from './baseRepository.js';

const base = createBaseRepository('podcasts');

export const podcastRepository = {
  ...base,

  listCategories: async () => {
    const { rows } = await query('SELECT * FROM podcast_categories ORDER BY name ASC');
    return rows;
  },

  findCategoryBySlug: async (slug) => {
    const { rows } = await query('SELECT id FROM podcast_categories WHERE slug = $1', [slug]);
    return rows[0] || null;
  },

  list: async ({
    offset, limit, sortBy, sortOrder, search, categoryId, featured,
  }) => {
    const conditions = ['is_active = true'];
    const params = [];

    if (categoryId) {
      params.push(categoryId);
      conditions.push(`category_id = $${params.length}`);
    }
    if (typeof featured === 'boolean') {
      params.push(featured);
      conditions.push(`is_featured = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`title ILIKE $${params.length}`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const listParams = [...params, limit, offset];
    const { rows } = await query(
      `SELECT * FROM podcasts ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams,
    );

    const { rows: countRows } = await query(
      `SELECT COUNT(*)::int AS count FROM podcasts ${whereClause}`,
      params,
    );

    return { rows, total: countRows[0].count };
  },

  findDetailByIdOrSlug: async (idOrSlug) => {
    const column = idOrSlugColumn(idOrSlug);
    const { rows } = await query(
      `SELECT p.*, pc.name AS category_name, pc.slug AS category_slug,
              pr.full_name AS presenter_name, pr.slug AS presenter_slug, pr.photo_url AS presenter_photo_url
       FROM podcasts p
       LEFT JOIN podcast_categories pc ON pc.id = p.category_id
       LEFT JOIN presenters pr ON pr.id = p.presenter_id
       WHERE p.${column} = $1`,
      [idOrSlug],
    );
    return rows[0] || null;
  },

  findBySlug: async (slug) => {
    const { rows } = await query('SELECT id FROM podcasts WHERE slug = $1', [slug]);
    return rows[0] || null;
  },

  create: async ({
    categoryId, presenterId, title, slug, description, coverImageUrl, coverPublicId, isFeatured,
  }) => {
    const { rows } = await query(
      `INSERT INTO podcasts (category_id, presenter_id, title, slug, description, cover_image_url, cover_public_id, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [categoryId || null, presenterId || null, title, slug, description || null,
        coverImageUrl || null, coverPublicId || null, !!isFeatured],
    );
    return rows[0];
  },

  update: async (id, {
    categoryId, presenterId, title, slug, description, coverImageUrl, coverPublicId, isFeatured, isActive,
  }) => {
    const { rows } = await query(
      `UPDATE podcasts SET
         category_id = COALESCE($2, category_id),
         presenter_id = COALESCE($3, presenter_id),
         title = COALESCE($4, title),
         slug = COALESCE($5, slug),
         description = COALESCE($6, description),
         cover_image_url = COALESCE($7, cover_image_url),
         cover_public_id = COALESCE($8, cover_public_id),
         is_featured = COALESCE($9, is_featured),
         is_active = COALESCE($10, is_active)
       WHERE id = $1
       RETURNING *`,
      [id, categoryId, presenterId, title, slug, description, coverImageUrl, coverPublicId, isFeatured, isActive],
    );
    return rows[0] || null;
  },

  // --- Episodes ---------------------------------------------------------

  listEpisodes: async (podcastId) => {
    const { rows } = await query(
      'SELECT * FROM podcast_episodes WHERE podcast_id = $1 ORDER BY published_at DESC',
      [podcastId],
    );
    return rows;
  },

  findEpisodeById: async (id) => {
    const { rows } = await query('SELECT * FROM podcast_episodes WHERE id = $1', [id]);
    return rows[0] || null;
  },

  createEpisode: async ({
    podcastId, title, description, audioUrl, audioPublicId, coverImageUrl, durationSeconds,
    fileSizeBytes, episodeNumber, seasonNumber, publishedAt, isPublished,
  }) => {
    const { rows } = await query(
      `INSERT INTO podcast_episodes
         (podcast_id, title, description, audio_url, audio_public_id, cover_image_url, duration_seconds,
          file_size_bytes, episode_number, season_number, published_at, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,COALESCE($11, now()),COALESCE($12, true))
       RETURNING *`,
      [podcastId, title, description || null, audioUrl, audioPublicId || null, coverImageUrl || null,
        durationSeconds || 0, fileSizeBytes || null, episodeNumber || null, seasonNumber || null,
        publishedAt || null, isPublished],
    );
    return rows[0];
  },

  updateEpisode: async (id, {
    title, description, audioUrl, audioPublicId, coverImageUrl, durationSeconds,
    fileSizeBytes, episodeNumber, seasonNumber, publishedAt, isPublished,
  }) => {
    const { rows } = await query(
      `UPDATE podcast_episodes SET
         title = COALESCE($2, title),
         description = COALESCE($3, description),
         audio_url = COALESCE($4, audio_url),
         audio_public_id = COALESCE($5, audio_public_id),
         cover_image_url = COALESCE($6, cover_image_url),
         duration_seconds = COALESCE($7, duration_seconds),
         file_size_bytes = COALESCE($8, file_size_bytes),
         episode_number = COALESCE($9, episode_number),
         season_number = COALESCE($10, season_number),
         published_at = COALESCE($11, published_at),
         is_published = COALESCE($12, is_published)
       WHERE id = $1
       RETURNING *`,
      [id, title, description, audioUrl, audioPublicId, coverImageUrl, durationSeconds,
        fileSizeBytes, episodeNumber, seasonNumber, publishedAt, isPublished],
    );
    return rows[0] || null;
  },

  removeEpisode: async (id) => {
    const { rowCount } = await query('DELETE FROM podcast_episodes WHERE id = $1', [id]);
    return rowCount > 0;
  },

  incrementPlayCount: async (id) => {
    const { rows } = await query(
      'UPDATE podcast_episodes SET play_count = play_count + 1 WHERE id = $1 RETURNING play_count',
      [id],
    );
    return rows[0] || null;
  },

  // --- Progress -----------------------------------------------------------

  upsertProgress: async (userId, episodeId, positionSeconds, isCompleted) => {
    const { rows } = await query(
      `INSERT INTO podcast_progress (user_id, episode_id, position_seconds, is_completed, updated_at)
       VALUES ($1,$2,$3,$4, now())
       ON CONFLICT (user_id, episode_id)
       DO UPDATE SET position_seconds = EXCLUDED.position_seconds,
                      is_completed = EXCLUDED.is_completed,
                      updated_at = now()
       RETURNING *`,
      [userId, episodeId, positionSeconds || 0, !!isCompleted],
    );
    return rows[0];
  },

  continueListening: async (userId) => {
    const { rows } = await query(
      `SELECT pp.position_seconds, pp.is_completed, pp.updated_at,
              e.id AS episode_id, e.title AS episode_title, e.audio_url, e.cover_image_url AS episode_cover,
              e.duration_seconds, e.podcast_id, p.title AS podcast_title, p.slug AS podcast_slug, p.cover_image_url AS podcast_cover
       FROM podcast_progress pp
       JOIN podcast_episodes e ON e.id = pp.episode_id
       JOIN podcasts p ON p.id = e.podcast_id
       WHERE pp.user_id = $1 AND pp.position_seconds > 0 AND pp.is_completed = false
       ORDER BY pp.updated_at DESC`,
      [userId],
    );
    return rows;
  },
};

export default podcastRepository;
