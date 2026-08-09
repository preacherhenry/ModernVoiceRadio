import { query, withTransaction } from '../config/database.js';

export const audioStreamRepository = {
  listActive: async () => {
    const { rows } = await query(
      'SELECT * FROM audio_streams WHERE is_active = true ORDER BY display_order ASC, created_at ASC',
    );
    return rows;
  },

  findDefault: async () => {
    const { rows } = await query('SELECT * FROM audio_streams WHERE is_default = true LIMIT 1');
    return rows[0] || null;
  },

  findById: async (id) => {
    const { rows } = await query('SELECT * FROM audio_streams WHERE id = $1', [id]);
    return rows[0] || null;
  },

  create: async ({
    name, protocol, url, bitrateKbps, format, isDefault, isActive, metadataUrl, displayOrder,
  }) => withTransaction(async (client) => {
    if (isDefault) {
      await client.query('UPDATE audio_streams SET is_default = false WHERE is_default = true');
    }
    const { rows } = await client.query(
      `INSERT INTO audio_streams (name, protocol, url, bitrate_kbps, format, is_default, is_active, metadata_url, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        name, protocol || 'icecast', url, bitrateKbps || 128, format || 'mp3',
        !!isDefault, isActive === undefined ? true : !!isActive, metadataUrl || null, displayOrder || 0,
      ],
    );
    return rows[0];
  }),

  update: async (id, {
    name, protocol, url, bitrateKbps, format, isDefault, isActive, metadataUrl, displayOrder,
  }) => withTransaction(async (client) => {
    if (isDefault === true) {
      await client.query('UPDATE audio_streams SET is_default = false WHERE is_default = true AND id <> $1', [id]);
    }
    const { rows } = await client.query(
      `UPDATE audio_streams SET
         name = COALESCE($2, name),
         protocol = COALESCE($3, protocol),
         url = COALESCE($4, url),
         bitrate_kbps = COALESCE($5, bitrate_kbps),
         format = COALESCE($6, format),
         is_default = COALESCE($7, is_default),
         is_active = COALESCE($8, is_active),
         metadata_url = COALESCE($9, metadata_url),
         display_order = COALESCE($10, display_order)
       WHERE id = $1
       RETURNING *`,
      [id, name, protocol, url, bitrateKbps, format, isDefault, isActive, metadataUrl, displayOrder],
    );
    return rows[0] || null;
  }),

  remove: async (id) => {
    const { rowCount } = await query('DELETE FROM audio_streams WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

export default audioStreamRepository;
