import { verifyAccessToken } from '../utils/jwt.js';
import { query } from '../config/database.js';

/**
 * Resolves an access token to the user behind it, or null for anonymous/invalid tokens.
 * Shared by every socket feature so chat and listener presence agree on who a socket is.
 */
export const resolveUserFromToken = async (token) => {
  if (!token) return null;
  try {
    const decoded = verifyAccessToken(token);
    const { rows } = await query(
      `SELECT u.id, u.full_name, u.avatar_url, u.is_active, r.name AS role_name
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1`,
      [decoded.id],
    );
    if (!rows.length || !rows[0].is_active) return null;
    return {
      id: rows[0].id,
      fullName: rows[0].full_name,
      avatarUrl: rows[0].avatar_url,
      roleName: rows[0].role_name,
    };
  } catch {
    return null;
  }
};

/**
 * Resolves the handshake token *before* any connection handler runs, so features that
 * fire immediately on connect (listener presence starts a session the moment playback
 * begins) already know whether a registered user is behind the socket. Doing this inside
 * a connection handler instead left a race where the first event could arrive while the
 * lookup was still in flight, and the session would be recorded as anonymous.
 *
 * Never rejects the connection: anonymous sockets are legitimate — guests can listen and
 * can read chat, they simply aren't attributed to an account.
 */
export const attachSocketUser = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    socket.data.user = await resolveUserFromToken(token);
    next();
  });
};

export default attachSocketUser;
