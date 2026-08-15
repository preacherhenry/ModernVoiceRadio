import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import app from './app.js';
import logger from './config/logger.js';
import { pool } from './config/database.js';
import { initFirebase } from './config/firebase.js';
import registerChatSocket from './sockets/chatSocket.js';
import registerListenerSocket from './sockets/listenerSocket.js';
import { scheduleAnalyticsRollup } from './jobs/rollupAnalytics.js';
import { scheduleChatMessageExpiry } from './jobs/expireChatMessages.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL].filter(Boolean),
    credentials: true,
  },
});

registerChatSocket(io);
registerListenerSocket(io);
app.set('io', io);

initFirebase();

const DB_CONNECT_ATTEMPTS = 5;
const DB_RETRY_DELAY_MS = 3000;

/**
 * Waits for the database, retrying before giving up. A serverless Postgres (Neon)
 * suspends its compute when idle and can take several seconds to wake — exiting on the
 * first failed attempt turned that ordinary cold start into a restart loop on the host,
 * since the process died faster than the database could come back.
 */
async function connectWithRetry() {
  for (let attempt = 1; attempt <= DB_CONNECT_ATTEMPTS; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop -- attempts are intentionally sequential
      await pool.query('SELECT 1');
      logger.info(`PostgreSQL connection established${attempt > 1 ? ` (attempt ${attempt})` : ''}.`);
      return;
    } catch (err) {
      const lastAttempt = attempt === DB_CONNECT_ATTEMPTS;
      logger.error(
        `Failed to connect to PostgreSQL (attempt ${attempt}/${DB_CONNECT_ATTEMPTS}): ${err.message}`
        + (lastAttempt ? '' : ` — retrying in ${DB_RETRY_DELAY_MS}ms`),
      );
      if (lastAttempt) process.exit(1);
      // eslint-disable-next-line no-await-in-loop -- deliberate backoff between attempts
      await new Promise((resolve) => { setTimeout(resolve, DB_RETRY_DELAY_MS); });
    }
  }
}

async function start() {
  await connectWithRetry();

  server.listen(PORT, () => {
    logger.info(`Modern Voice Radio API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  scheduleAnalyticsRollup();
  scheduleChatMessageExpiry(io);
}

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason instanceof Error ? reason.stack : reason}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received — closing server gracefully.');
  server.close(() => pool.end().then(() => process.exit(0)));
});

start();
