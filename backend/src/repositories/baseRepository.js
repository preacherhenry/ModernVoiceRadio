import { query } from '../config/database.js';

/**
 * Minimal generic repository factory implementing the Repository Pattern.
 * Each resource repository composes this with its own bespoke queries rather
 * than inheriting — keeps SQL explicit and easy to index/optimize per table.
 *
 * @param {string} table
 */
export const createBaseRepository = (table) => ({
  findById: async (id) => {
    const { rows } = await query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return rows[0] || null;
  },

  /** Resolves a route param that may be either a UUID primary key or a slug. */
  findByIdOrSlug: async (idOrSlug) => {
    const { rows } = await query(`SELECT * FROM ${table} WHERE ${idOrSlugColumn(idOrSlug)} = $1`, [idOrSlug]);
    return rows[0] || null;
  },

  remove: async (id) => {
    const { rowCount } = await query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    return rowCount > 0;
  },

  count: async () => {
    const { rows } = await query(`SELECT COUNT(*)::int AS count FROM ${table}`);
    return rows[0].count;
  },
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True when `value` looks like a well-formed UUID. */
export const isUuid = (value) => typeof value === 'string' && UUID_REGEX.test(value);

/**
 * Determines which column ("id" or "slug") a `:idOrSlug` route param should be
 * matched against, so callers can safely build `WHERE ${idOrSlugColumn(param)} = $1`
 * without ever feeding a non-UUID string into a `uuid`-typed column comparison.
 * @param {string} idOrSlug
 */
export const idOrSlugColumn = (idOrSlug) => (isUuid(idOrSlug) ? 'id' : 'slug');

/**
 * Builds a `WHERE ... ILIKE` fragment + params for a simple search box across
 * one or more text columns, continuing a param list that already has `startIndex - 1` entries.
 * @param {string[]} columns
 * @param {string|null} search
 * @param {number} startIndex 1-based position of the next placeholder
 */
export const buildSearchClause = (columns, search, startIndex) => {
  if (!search || !columns.length) return { clause: '', params: [] };
  const conditions = columns.map((col, i) => `${col} ILIKE $${startIndex + i}`);
  return {
    clause: `(${conditions.join(' OR ')})`,
    params: columns.map(() => `%${search}%`),
  };
};
