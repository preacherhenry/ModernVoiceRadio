import { query } from '../config/database.js';
import { createBaseRepository } from './baseRepository.js';

const base = createBaseRepository('advertisements');

export const advertisementRepository = {
  ...base,

  list: async ({
    offset, limit, sortBy, sortOrder, search, placement,
  }) => {
    const conditions = [];
    const params = [];

    if (placement) {
      params.push(placement);
      conditions.push(`placement = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`title ILIKE $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const listParams = [...params, limit, offset];
    const { rows } = await query(
      `SELECT * FROM advertisements ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams,
    );

    const { rows: countRows } = await query(
      `SELECT COUNT(*)::int AS count FROM advertisements ${whereClause}`,
      params,
    );

    return { rows, total: countRows[0].count };
  },

  active: async (placement) => {
    const params = [];
    const conditions = [
      'is_active = true',
      // start_date/end_date are plain DATEs picked from the admin's own calendar, with no
      // timezone attached — evaluate "today" in the station's local timezone (Africa/Lusaka,
      // UTC+2) rather than the server's UTC clock, otherwise an ad set to "start today" won't
      // show as active until UTC catches up to the admin's local date.
      "(start_date IS NULL OR start_date <= (now() AT TIME ZONE 'Africa/Lusaka')::date)",
      "(end_date IS NULL OR end_date >= (now() AT TIME ZONE 'Africa/Lusaka')::date)",
    ];
    if (placement) {
      params.push(placement);
      conditions.push(`placement = $${params.length}`);
    }
    const { rows } = await query(
      `SELECT * FROM advertisements WHERE ${conditions.join(' AND ')} ORDER BY display_order ASC`,
      params,
    );
    return rows;
  },

  incrementImpression: async (id) => {
    const { rows } = await query(
      'UPDATE advertisements SET impressions = impressions + 1 WHERE id = $1 RETURNING impressions',
      [id],
    );
    return rows[0] || null;
  },

  incrementClick: async (id) => {
    const { rows } = await query(
      'UPDATE advertisements SET clicks = clicks + 1 WHERE id = $1 RETURNING clicks',
      [id],
    );
    return rows[0] || null;
  },

  create: async ({
    title, imageUrl, imagePublicId, targetUrl, placement, startDate, endDate, isActive, displayOrder,
    description, contactPhone, contactWhatsapp, contactEmail, contactAddress,
  }) => {
    const { rows } = await query(
      `INSERT INTO advertisements
         (title, image_url, image_public_id, target_url, placement, start_date, end_date, is_active, display_order,
          description, contact_phone, contact_whatsapp, contact_email, contact_address)
       VALUES ($1,$2,$3,$4,COALESCE($5,'home_banner'),$6,$7,COALESCE($8,true),$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [title, imageUrl, imagePublicId || null, targetUrl || null, placement || null,
        startDate || null, endDate || null, isActive, displayOrder || 0,
        description || null, contactPhone || null, contactWhatsapp || null, contactEmail || null, contactAddress || null],
    );
    return rows[0];
  },

  update: async (id, {
    title, imageUrl, imagePublicId, targetUrl, placement, startDate, endDate, isActive, displayOrder,
    description, contactPhone, contactWhatsapp, contactEmail, contactAddress,
  }) => {
    const { rows } = await query(
      `UPDATE advertisements SET
         title = COALESCE($2, title),
         image_url = COALESCE($3, image_url),
         image_public_id = COALESCE($4, image_public_id),
         target_url = COALESCE($5, target_url),
         placement = COALESCE($6, placement),
         start_date = COALESCE($7, start_date),
         end_date = COALESCE($8, end_date),
         is_active = COALESCE($9, is_active),
         display_order = COALESCE($10, display_order),
         description = COALESCE($11, description),
         contact_phone = COALESCE($12, contact_phone),
         contact_whatsapp = COALESCE($13, contact_whatsapp),
         contact_email = COALESCE($14, contact_email),
         contact_address = COALESCE($15, contact_address)
       WHERE id = $1
       RETURNING *`,
      [id, title, imageUrl, imagePublicId, targetUrl, placement, startDate, endDate, isActive, displayOrder,
        description, contactPhone, contactWhatsapp, contactEmail, contactAddress],
    );
    return rows[0] || null;
  },
};

export default advertisementRepository;
