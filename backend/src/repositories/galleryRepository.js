import { query } from '../config/database.js';
import { createBaseRepository } from './baseRepository.js';

const base = createBaseRepository('gallery');

export const galleryRepository = {
  ...base,

  list: async ({
    offset, limit, sortBy, sortOrder, search, mediaType, eventName,
  }) => {
    const conditions = [];
    const params = [];

    if (mediaType) {
      params.push(mediaType);
      conditions.push(`media_type = $${params.length}`);
    }
    if (eventName) {
      params.push(eventName);
      conditions.push(`event_name = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(title ILIKE $${params.length} OR event_name ILIKE $${params.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const listParams = [...params, limit, offset];
    const { rows } = await query(
      `SELECT * FROM gallery ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams,
    );

    const { rows: countRows } = await query(
      `SELECT COUNT(*)::int AS count FROM gallery ${whereClause}`,
      params,
    );

    return { rows, total: countRows[0].count };
  },

  create: async ({
    title, mediaType, mediaUrl, mediaPublicId, thumbnailUrl, eventName, eventDate, displayOrder,
  }) => {
    const { rows } = await query(
      `INSERT INTO gallery (title, media_type, media_url, media_public_id, thumbnail_url, event_name, event_date, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [title || null, mediaType, mediaUrl, mediaPublicId || null, thumbnailUrl || null,
        eventName || null, eventDate || null, displayOrder || 0],
    );
    return rows[0];
  },
};

export default galleryRepository;
