import { query } from '../config/database.js';
import logger from '../config/logger.js';

const ROOM = 'live-listeners';

/**
 * Sessions shorter than this are treated as noise rather than listening — a reconnect
 * blip, or a tap that was immediately undone. They are still recorded (so nothing is
 * silently thrown away) but excluded from analytics, which keeps a page refresh from
 * inflating anyone's session count.
 */
export const MIN_MEANINGFUL_SESSION_SECONDS = 5;

/**
 * Returns the number of sockets currently present in the live-listeners room.
 * Exposed for reuse by analyticsService's "live listeners" overview tile.
 * @param {import('socket.io').Server} io
 */
export const getLiveListenerCount = (io) => io.sockets.adapter.rooms.get(ROOM)?.size || 0;

/** Closes a session, stamping its end time and computing how long it ran. */
const closeSession = async (sessionId) => {
  await query(
    `UPDATE listener_sessions
     SET ended_at = now(),
         duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (now() - started_at))::int)
     WHERE id = $1 AND ended_at IS NULL`,
    [sessionId],
  );
};

/**
 * Closes any session still marked open for this user from an earlier connection.
 *
 * A refresh or a dropped connection produces a new socket before (or instead of) the old
 * one's disconnect, which would otherwise leave the previous session open forever —
 * counting toward nothing and never contributing a duration. One person listening from
 * two devices at once is rare enough that collapsing to the newest connection is the
 * right trade for keeping the numbers honest.
 */
const closeStaleSessionsForUser = async (userId, exceptSessionId) => {
  await query(
    `UPDATE listener_sessions
     SET ended_at = now(),
         duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (now() - started_at))::int)
     WHERE user_id = $1 AND ended_at IS NULL AND id <> $2`,
    [userId, exceptSessionId],
  );
};

/**
 * Closes sessions left open by a process that stopped without disconnecting its sockets
 * (a crash, a redeploy). Without this they keep a null duration forever and quietly
 * drag the "total listening time" figure down. Called once at startup.
 */
export const closeOrphanedSessions = async () => {
  const { rowCount } = await query(
    `UPDATE listener_sessions
     SET ended_at = COALESCE(ended_at, now()),
         duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (now() - started_at))::int)
     WHERE ended_at IS NULL`,
  );
  if (rowCount) logger.info(`Closed ${rowCount} listener session(s) orphaned by a previous run.`);
  return rowCount;
};

/**
 * Registers realtime "currently listening" presence tracking.
 *
 * Sessions belonging to a signed-in listener carry their user id, which is what the
 * admin dashboard's listener analytics are built on. Guests still create sessions (the
 * live count and the country/device breakdowns include them) but are never attributed
 * to an account.
 *
 * @param {import('socket.io').Server} io
 */
export default function registerListenerSocket(io) {
  io.on('connection', (socket) => {
    socket.on('join_listening', async (payload = {}) => {
      try {
        // A second join on the same socket means playback restarted without the socket
        // dropping — keep the session already running rather than opening a duplicate.
        if (socket.data.sessionId) return;

        const {
          streamId, country, city, deviceType,
        } = payload;

        // Resolved from the handshake token by attachSocketUser before this handler ran.
        const user = socket.data.user;

        const { rows } = await query(
          `INSERT INTO listener_sessions (user_id, session_key, stream_id, country, city, device_type, ip_address)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           RETURNING id`,
          [
            user?.id || null,
            socket.id, streamId || null, country || null, city || null, deviceType || null,
            socket.handshake.address || null,
          ],
        );

        socket.data.sessionId = rows[0].id;
        socket.join(ROOM);

        if (user?.id) await closeStaleSessionsForUser(user.id, rows[0].id);

        io.to(ROOM).emit('listener_count', getLiveListenerCount(io));
      } catch (err) {
        logger.error(`listenerSocket join_listening failed: ${err.message}`);
      }
    });

    /** Playback stopped but the app stayed open — end the session without waiting for a disconnect. */
    socket.on('leave_listening', async () => {
      try {
        if (!socket.data.sessionId) return;
        await closeSession(socket.data.sessionId);
        socket.data.sessionId = null;
        socket.leave(ROOM);
        io.to(ROOM).emit('listener_count', getLiveListenerCount(io));
      } catch (err) {
        logger.error(`listenerSocket leave_listening failed: ${err.message}`);
      }
    });

    socket.on('disconnect', async () => {
      try {
        if (socket.data.sessionId) {
          await closeSession(socket.data.sessionId);
          socket.data.sessionId = null;
        }
      } catch (err) {
        logger.error(`listenerSocket disconnect cleanup failed: ${err.message}`);
      } finally {
        // By the time 'disconnect' fires, Socket.io has already removed this socket
        // from all rooms, so the emitted count already reflects the decrement.
        io.to(ROOM).emit('listener_count', getLiveListenerCount(io));
      }
    });
  });
}
