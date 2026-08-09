/**
 * Normalizes page/limit/sort/order query params shared by every list endpoint.
 * @param {import('express').Request['query']} query
 * @param {{ defaultLimit?: number, maxLimit?: number, allowedSort?: string[], defaultSort?: string }} [opts]
 */
export const parseListQuery = (query, opts = {}) => {
  const {
    defaultLimit = 20,
    maxLimit = 100,
    allowedSort = ['created_at'],
    defaultSort = 'created_at',
  } = opts;

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const offset = (page - 1) * limit;

  const sortBy = allowedSort.includes(query.sortBy) ? query.sortBy : defaultSort;
  const sortOrder = String(query.sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const search = typeof query.search === 'string' && query.search.trim() ? query.search.trim() : null;

  return {
    page, limit, offset, sortBy, sortOrder, search,
  };
};
