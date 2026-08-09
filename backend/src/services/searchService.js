import { query } from '../config/database.js';

const VALID_TYPES = ['programs', 'presenters', 'news', 'podcasts', 'episodes'];
const RESULT_LIMIT = 8;

const searchers = {
  programs: async (like) => {
    const { rows } = await query(
      `SELECT id, title, slug, cover_image_url FROM programs
       WHERE is_active = true AND title ILIKE $1
       ORDER BY title ASC LIMIT ${RESULT_LIMIT}`,
      [like],
    );
    return rows;
  },
  presenters: async (like) => {
    const { rows } = await query(
      `SELECT id, full_name, slug, photo_url FROM presenters
       WHERE is_active = true AND full_name ILIKE $1
       ORDER BY full_name ASC LIMIT ${RESULT_LIMIT}`,
      [like],
    );
    return rows;
  },
  news: async (like) => {
    const { rows } = await query(
      `SELECT id, title, slug, cover_image_url, published_at FROM news
       WHERE is_published = true AND title ILIKE $1
       ORDER BY published_at DESC LIMIT ${RESULT_LIMIT}`,
      [like],
    );
    return rows;
  },
  podcasts: async (like) => {
    const { rows } = await query(
      `SELECT id, title, slug, cover_image_url FROM podcasts
       WHERE is_active = true AND title ILIKE $1
       ORDER BY title ASC LIMIT ${RESULT_LIMIT}`,
      [like],
    );
    return rows;
  },
  episodes: async (like) => {
    const { rows } = await query(
      `SELECT e.id, e.title, e.podcast_id, e.cover_image_url, e.published_at, p.slug AS podcast_slug, p.title AS podcast_title
       FROM podcast_episodes e
       JOIN podcasts p ON p.id = e.podcast_id
       WHERE e.is_published = true AND e.title ILIKE $1
       ORDER BY e.published_at DESC LIMIT ${RESULT_LIMIT}`,
      [like],
    );
    return rows;
  },
};

/**
 * Parses a comma-separated `types` query param into the set of result buckets to
 * search. Defaults to all types. "podcasts" always pulls in "episodes" too, since
 * episode titles are searched alongside their parent podcast.
 * @param {string|undefined} raw
 */
const resolveTypes = (raw) => {
  let types = raw
    ? raw.split(',').map((t) => t.trim().toLowerCase()).filter((t) => VALID_TYPES.includes(t))
    : [...VALID_TYPES];
  if (!types.length) types = [...VALID_TYPES];
  if (types.includes('podcasts') && !types.includes('episodes')) types.push('episodes');
  return types;
};

export const searchService = {
  search: async (q, typesParam) => {
    const term = (q || '').trim();
    if (term.length < 2) return {};

    const like = `%${term}%`;
    const types = resolveTypes(typesParam);

    const entries = await Promise.all(types.map(async (type) => [type, await searchers[type](like)]));
    return Object.fromEntries(entries);
  },
};

export default searchService;
