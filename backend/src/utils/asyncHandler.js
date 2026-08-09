/**
 * Wraps an async Express route/middleware so rejected promises are
 * forwarded to the centralized error handler instead of crashing the process.
 * @param {Function} fn
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
