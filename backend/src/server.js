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

async function start() {
  try {
    await pool.query('SELECT 1');
    logger.info('PostgreSQL connection established.');
  } catch (err) {
    logger.error(`Failed to connect to PostgreSQL: ${err.message}`);
    process.exit(1);
  }

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
