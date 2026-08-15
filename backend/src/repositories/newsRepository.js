import { query } from '../config/database.js';
import { createBaseRepository, idOrSlugColumn } from './baseRepository.js';

const base = createBaseRepository('news');

export const newsRepository = {
  ...base,

  listCategories: async () => {
    const { rows } = await query('SELECT * FROM news_categories ORDER BY name ASC');
    return rows;
  },

  list: async ({
    offset, limit, sortBy, sortOrder, search, categoryId, breaking, trending, includeUnpublished,
  }) => {
    const conditions = [];
    const params = [];

    if (!includeUnpublished) conditions.push('is_published = true');
    if (categoryId) {
      params.push(categoryId);
      conditions.push(`category_id = $${params.length}`);
    }
    if (typeof breaking === 'boolean') {
      params.push(breaking);
      conditions.push(`is_breaking = $${params.length}`);
    }
    if (typeof trending === 'boolean') {
      params.push(trending);
      conditions.push(`is_trending = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`title ILIKE $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const listParams = [...params, limit, offset];
    const { rows } = await query(
      // Breaking stories are always pinned above everything else regardless of when
      // they were posted; within each group (breaking / not breaking), newest first.
      `SELECT * FROM news ${whereClause}
       ORDER BY is_breaking DESC, ${sortBy} ${sortOrder}
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams,
    );

    const { rows: countRows } = await query(
      `SELECT COUNT(*)::int AS count FROM news ${whereClause}`,
      params,
    );

    return { rows, total: countRows[0].count };
  },

  findDetailByIdOrSlug: async (idOrSlug, includeUnpublished) => {
    const column = idOrSlugColumn(idOrSlug);
    const publishedClause = includeUnpublished ? '' : 'AND is_published = true';
    const { rows } = await query(
      `SELECT * FROM news WHERE ${column} = $1 ${publishedClause}`,
      [idOrSlug],
    );
    return rows[0] || null;
  },

  incrementViewCount: async (id) => {
    await query('UPDATE news SET view_count = view_count + 1 WHERE id = $1', [id]);
  },

  findBySlug: async (slug) => {
    const { rows } = await query('SELECT id FROM news WHERE slug = $1', [slug]);
    return rows[0] || null;
  },

  create: async ({
    categoryId, authorId, title, slug, excerpt, content, coverImageUrl, coverPublicId,
    isBreaking, isTrending, isPublished, reporterName, reportDate,
  }) => {
    const { rows } = await query(
      `INSERT INTO news
         (category_id, author_id, title, slug, excerpt, content, cover_image_url, cover_public_id,
          is_breaking, is_trending, is_published, reporter_name, report_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [categoryId || null, authorId || null, title, slug, excerpt || null, content,
        coverImageUrl || null, coverPublicId || null, !!isBreaking, !!isTrending,
        isPublished === undefined ? true : !!isPublished,
        reporterName || null, reportDate || null],
    );
    return rows[0];
  },

  update: async (id, {
    categoryId, title, slug, excerpt, content, coverImageUrl, coverPublicId,
    isBreaking, isTrending, isPublished, reporterName, reportDate,
  }) => {
    const { rows } = await query(
      // The credit columns use CASE rather than COALESCE so a credit can actually be
      // removed: undefined (field absent) leaves the column alone, while an explicit
      // empty string clears it. COALESCE can't tell those apart — both arrive as null.
      `UPDATE news SET
         category_id = COALESCE($2, category_id),
         title = COALESCE($3, title),
         slug = COALESCE($4, slug),
         excerpt = COALESCE($5, excerpt),
         content = COALESCE($6, content),
         cover_image_url = COALESCE($7, cover_image_url),
         cover_public_id = COALESCE($8, cover_public_id),
         is_breaking = COALESCE($9, is_breaking),
         is_trending = COALESCE($10, is_trending),
         is_published = COALESCE($11, is_published),
         reporter_name = CASE WHEN $12::text IS NULL THEN reporter_name ELSE NULLIF($12::text, '') END,
         report_date   = CASE WHEN $13::text IS NULL THEN report_date   ELSE NULLIF($13::text, '')::date END
       WHERE id = $1
       RETURNING *`,
      [id, categoryId, title, slug, excerpt, content, coverImageUrl, coverPublicId,
        isBreaking, isTrending, isPublished,
        reporterName === undefined ? null : reporterName,
        reportDate === undefined ? null : reportDate],
    );
    return rows[0] || null;
  },

  listMedia: async (newsId) => {
    const { rows } = await query(
      'SELECT * FROM news_media WHERE news_id = $1 ORDER BY display_order ASC, created_at ASC',
      [newsId],
    );
    return rows;
  },

  addMedia: async (newsId, items) => {
    if (!items.length) return [];
    const values = [];
    const params = [];
    items.forEach((item, i) => {
      const base = i * 5;
      values.push(`($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5})`);
      params.push(newsId, item.mediaType, item.mediaUrl, item.mediaPublicId || null, i);
    });
    const { rows } = await query(
      `INSERT INTO news_media (news_id, media_type, media_url, media_public_id, display_order)
       VALUES ${values.join(',')}
       RETURNING *`,
      params,
    );
    return rows;
  },

  findMediaById: async (mediaId) => {
    const { rows } = await query('SELECT * FROM news_media WHERE id = $1', [mediaId]);
    return rows[0] || null;
  },

  removeMedia: async (mediaId) => {
    const { rows } = await query('DELETE FROM news_media WHERE id = $1 RETURNING *', [mediaId]);
    return rows[0] || null;
  },
};

export default newsRepository;
