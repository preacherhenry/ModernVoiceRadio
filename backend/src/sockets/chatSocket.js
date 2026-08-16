import { verifyAccessToken } from '../utils/jwt.js';
import { query } from '../config/database.js';
import chatRepository from '../repositories/chatRepository.js';
import chatService from '../services/chatService.js';
import logger from '../config/logger.js';
import { resolveUserFromToken } from '../utils/socketAuth.js';

const MODERATOR_ROLES = ['moderator', 'admin', 'super_admin'];
const ROOM = 'chat';


/**
 * Registers live-chat handlers on the shared Socket.io server (room "chat").
 * Anonymous sockets may connect and receive broadcast messages, but must
 * authenticate with a valid access token before they can emit send_message,
 * pin_message, or delete_message.
 * @param {import('socket.io').Server} io
 */
export default function registerChatSocket(io) {
  io.on('connection', (socket) => {
    socket.join(ROOM);

    // socket.data.user is resolved from the handshake token by attachSocketUser before
    // this handler runs; re-authentication below updates it in place.
    const authenticate = async (token) => {
      const user = await resolveUserFromToken(token);
      if (user) socket.data.user = user;
      return user;
    };

    // Or via an explicit event after connecting
    socket.on('authenticate', async (payload, callback) => {
      const token = typeof payload === 'string' ? payload : payload && payload.token;
      const user = await authenticate(token);
      if (typeof callback === 'function') callback({ authenticated: !!user });
    });

    socket.on('send_message', async (payload = {}, callback) => {
      try {
        const { message, replyToId } = payload;
        const user = socket.data.user;

        if (!user) {
          socket.emit('error', { message: 'You must be signed in to send messages' });
          return;
        }
        if (!message || !String(message).trim()) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        if (!MODERATOR_ROLES.includes(user.roleName)) {
          const locked = await chatService.getLockState();
          if (locked) {
            socket.emit('error', { message: 'Live chat is currently locked by the station.' });
            return;
          }
        }

        const banned = await chatRepository.isUserBanned(user.id);
        if (banned) {
          socket.emit('error', { message: 'You have been banned from the live chat' });
          return;
        }

        const saved = await chatRepository.insertMessage({
          userId: user.id,
          displayName: user.fullName,
          avatarUrl: user.avatarUrl,
          message: String(message).trim(),
          replyToId: replyToId || null,
          isAnnouncement: false,
        });

        io.to(ROOM).emit('new_message', saved);
        if (typeof callback === 'function') callback({ success: true, message: saved });
      } catch (err) {
        logger.error(`chatSocket send_message failed: ${err.message}`);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('pin_message', async ({ id, isPinned } = {}) => {
      try {
        const user = socket.data.user;
        if (!user || !MODERATOR_ROLES.includes(user.roleName)) {
          socket.emit('error', { message: 'You do not have permission to pin messages' });
          return;
        }
        const updated = await chatRepository.setPinned(id, !!isPinned);
        if (updated) io.to(ROOM).emit('message_pinned', updated);
      } catch (err) {
        logger.error(`chatSocket pin_message failed: ${err.message}`);
        socket.emit('error', { message: 'Failed to update pin status' });
      }
    });

    socket.on('delete_message', async ({ id } = {}) => {
      try {
        const user = socket.data.user;
        if (!user || !MODERATOR_ROLES.includes(user.roleName)) {
          socket.emit('error', { message: 'You do not have permission to delete messages' });
          return;
        }
        const deleted = await chatRepository.softDelete(id, user.id);
        if (deleted) io.to(ROOM).emit('message_deleted', { id: deleted.id });
      } catch (err) {
        logger.error(`chatSocket delete_message failed: ${err.message}`);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    socket.on('disconnect', () => {
      // No explicit chat state to clean up beyond default Socket.io room bookkeeping.
    });
  });
}
