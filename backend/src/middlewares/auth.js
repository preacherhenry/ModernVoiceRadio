import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { query } from '../config/database.js';

/**
 * Requires a valid JWT access token. Attaches { id, roleId, roleName } to req.user.
 */
export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  const token = header.split(' ')[1];
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized(err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token');
  }

  const { rows } = await query(
    `SELECT u.id, u.full_name, u.email, u.is_active, r.name AS role_name
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1`,
    [decoded.id],
  );

  if (!rows.length || !rows[0].is_active) {
    throw ApiError.unauthorized('Account is inactive or no longer exists');
  }

  req.user = {
    id: rows[0].id,
    fullName: rows[0].full_name,
    email: rows[0].email,
    roleId: decoded.roleId,
    roleName: rows[0].role_name,
  };
  next();
});

/** Allows the request through with req.user populated if a valid token is present, but never rejects. */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  try {
    const decoded = verifyAccessToken(header.split(' ')[1]);
    const { rows } = await query(
      `SELECT u.id, r.name AS role_name FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = $1 AND u.is_active = true`,
      [decoded.id],
    );
    if (rows.length) req.user = { id: rows[0].id, roleName: rows[0].role_name };
  } catch {
    // ignore invalid/expired tokens on optional routes
  }
  next();
});

/**
 * Restricts a route to one or more role names, e.g. requireRole('admin', 'super_admin').
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.roleName)) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }
  return next();
};

/**
 * Restricts a route to users whose role holds a specific fine-grained permission code
 * (e.g. "news.create"). super_admin always passes.
 */
export const requirePermission = (permissionCode) => asyncHandler(async (req, res, next) => {
  if (!req.user) throw ApiError.unauthorized();
  if (req.user.roleName === 'super_admin') return next();

  const { rows } = await query(
    `SELECT 1 FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.role_id = $1 AND p.code = $2`,
    [req.user.roleId, permissionCode],
  );

  if (!rows.length) throw ApiError.forbidden(`Missing permission: ${permissionCode}`);
  return next();
});
