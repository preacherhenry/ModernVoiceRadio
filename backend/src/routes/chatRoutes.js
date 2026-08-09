import { Router } from 'express';
import * as chatController from '../controllers/chatController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  listMessagesValidator, messageIdParamValidator, pinMessageValidator, banValidator, unbanValidator,
  lockStateValidator, sendMessageValidator,
} from '../validators/chatValidators.js';

const router = Router();
const requireModerator = [requireAuth, requireRole('moderator', 'admin', 'super_admin')];

router.get('/lock', chatController.getLockState);
router.put('/lock', ...requireModerator, lockStateValidator, validate, chatController.setLockState);

router.get('/messages/pinned', chatController.listPinned);
router.get('/messages', listMessagesValidator, validate, chatController.listMessages);
router.post('/messages', ...requireModerator, sendMessageValidator, validate, chatController.sendMessage);
router.delete(
  '/messages/:id',
  requireAuth,
  requireRole('moderator', 'admin', 'super_admin'),
  messageIdParamValidator,
  validate,
  chatController.deleteMessage,
);
router.patch(
  '/messages/:id/pin',
  requireAuth,
  requireRole('moderator', 'admin', 'super_admin'),
  pinMessageValidator,
  validate,
  chatController.pinMessage,
);

router.post(
  '/bans',
  requireAuth,
  requireRole('moderator', 'admin', 'super_admin'),
  banValidator,
  validate,
  chatController.ban,
);
router.delete(
  '/bans/:userId',
  requireAuth,
  requireRole('moderator', 'admin', 'super_admin'),
  unbanValidator,
  validate,
  chatController.unban,
);

export default router;
