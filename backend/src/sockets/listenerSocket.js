import { query } from '../config/database.js';
import logger from '../config/logger.js';

const ROOM = 'live-listeners';

/**
 * Returns the number of sockets currently present in the live-listeners room.
 * Exposed for reuse by analyticsService's "live listeners" overview tile.
 * @param {import('socket.io').Server} io
 */
export const getLiveListenerCount = (io) => io.sockets.adapter.rooms.get(ROOM)?.size || 0;

/**
 * Registers realtime "currently listening" presence tracking.
 * @param {import('socket.io').Server} io
 */
export default function registerListenerSocket(io) {
  io.on('connection', (socket) => {
    socket.on('join_listening', async (payload = {}) => {
      try {
        const {
          streamId, country, city, deviceType,
        } = payload;

        const { rows } = await query(
          `INSERT INTO listener_sessions (session_key, stream_id, country, city, device_type, ip_address)
           VALUES ($1,$2,$3,$4,$5,$6)
           RETURNING id`,
          [
            socket.id, streamId || null, country || null, city || null, deviceType || null,
            socket.handshake.address || null,
          ],
        );

        socket.data.sessionId = rows[0].id;
        socket.join(ROOM);

        io.to(ROOM).emit('listener_count', getLiveListenerCount(io));
      } catch (err) {
        logger.error(`listenerSocket join_listening failed: ${err.message}`);
      }
    });

    socket.on('disconnect', async () => {
      try {
        if (socket.data.sessionId) {
          await query(
            `UPDATE listener_sessions
             SET ended_at = now(), duration_seconds = EXTRACT(EPOCH FROM (now() - started_at))
             WHERE id = $1`,
            [socket.data.sessionId],
          );
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
