/**
 * Converts free text into a URL-safe slug fragment, e.g. "Morning Rush!" -> "morning-rush".
 * Used as a fallback when a create payload omits an explicit `slug`.
 * @param {string} text
 */
export const slugify = (text) => String(text || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 190);

export default slugify;
