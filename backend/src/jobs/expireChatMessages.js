import chatRepository from '../repositories/chatRepository.js';
import logger from '../config/logger.js';

const EXPIRY_MINUTES = 5;
const CHECK_INTERVAL_MS = 30 * 1000;
const ROOM = 'chat';

/**
 * Starts an interval-based job that soft-deletes chat messages older than
 * EXPIRY_MINUTES and broadcasts a `message_deleted` event for each one, so connected
 * clients drop them from the UI the same way a moderator-initiated delete would.
 * @param {import('socket.io').Server} io
 */
export function scheduleChatMessageExpiry(io) {
  setInterval(async () => {
    try {
      const expired = await chatRepository.expireOlderThan(EXPIRY_MINUTES);
      if (expired.length) {
        expired.forEach((row) => io.to(ROOM).emit('message_deleted', { id: row.id }));
        logger.info(`Expired ${expired.length} chat message(s) older than ${EXPIRY_MINUTES} minute(s).`);
      }
    } catch (err) {
      logger.error(`Chat message expiry job failed: ${err.message}`);
    }
  }, CHECK_INTERVAL_MS);

  logger.info(`Chat message expiry scheduler started (checks every ${CHECK_INTERVAL_MS / 1000}s, expires messages older than ${EXPIRY_MINUTES}m).`);
}

export default scheduleChatMessageExpiry;
