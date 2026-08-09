/**
 * Consistent success envelope for every endpoint.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {any} [data]
 * @param {object} [meta] pagination info, etc.
 */
export const sendSuccess = (res, statusCode, message, data = null, meta = undefined) => (
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  })
);

/**
 * Builds a consistent pagination meta block from a total row count.
 * @param {number} page
 * @param {number} limit
 * @param {number} total
 */
export const buildPaginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
