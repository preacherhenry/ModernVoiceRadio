import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { createNotificationValidator, notificationIdParamValidator } from '../validators/notificationValidators.js';

const router = Router();

router.get('/mine', requireAuth, notificationController.listMine);
router.get('/unread-count', requireAuth, notificationController.unreadCount);
router.patch('/:id/read', requireAuth, notificationIdParamValidator, validate, notificationController.markRead);

router.post(
  '/',
  requireAuth,
  requireRole('admin', 'editor', 'super_admin'),
  createNotificationValidator,
  validate,
  notificationController.create,
);
router.get('/', requireAuth, requireRole('admin', 'super_admin'), notificationController.list);

export default router;
