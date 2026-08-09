import logger from '../config/logger.js';
import ApiError from '../utils/ApiError.js';

// eslint-disable-next-line no-unused-vars
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    if (error.code === '23505') error = ApiError.conflict('A record with these details already exists');
    else if (error.code === '23503') error = ApiError.badRequest('Related resource does not exist');
    else if (error.name === 'JsonWebTokenError') error = ApiError.unauthorized('Invalid token');
    else error = ApiError.internal(process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message);
  }

  if (error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} — ${err.stack || err.message}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} — ${error.statusCode} ${error.message}`);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.details?.length ? { details: error.details } : {}),
  });
};
