import { query } from '../config/database.js';

export const contactRepository = {
  get: async () => {
    const { rows } = await query('SELECT * FROM contact_information ORDER BY updated_at DESC LIMIT 1');
    return rows[0] || null;
  },

  create: async (data) => {
    const { rows } = await query(
      `INSERT INTO contact_information
         (station_name, phone, whatsapp, email, address, latitude, longitude,
          facebook_url, instagram_url, tiktok_url, youtube_url, twitter_url, website_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        data.stationName || 'Modern Voice Radio', data.phone || null, data.whatsapp || null, data.email || null,
        data.address || null, data.latitude ?? null, data.longitude ?? null, data.facebookUrl || null,
        data.instagramUrl || null, data.tiktokUrl || null, data.youtubeUrl || null, data.twitterUrl || null,
        data.websiteUrl || null,
      ],
    );
    return rows[0];
  },

  update: async (id, data) => {
    const { rows } = await query(
      `UPDATE contact_information SET
         station_name = COALESCE($2, station_name),
         phone = COALESCE($3, phone),
         whatsapp = COALESCE($4, whatsapp),
         email = COALESCE($5, email),
         address = COALESCE($6, address),
         latitude = COALESCE($7, latitude),
         longitude = COALESCE($8, longitude),
         facebook_url = COALESCE($9, facebook_url),
         instagram_url = COALESCE($10, instagram_url),
         tiktok_url = COALESCE($11, tiktok_url),
         youtube_url = COALESCE($12, youtube_url),
         twitter_url = COALESCE($13, twitter_url),
         website_url = COALESCE($14, website_url)
       WHERE id = $1
       RETURNING *`,
      [
        id, data.stationName, data.phone, data.whatsapp, data.email, data.address, data.latitude, data.longitude,
        data.facebookUrl, data.instagramUrl, data.tiktokUrl, data.youtubeUrl, data.twitterUrl, data.websiteUrl,
      ],
    );
    return rows[0];
  },
};

export default contactRepository;
