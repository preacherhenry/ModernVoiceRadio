import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { imageUpload } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import {
  idParamValidator, updateRoleValidator, updateStatusValidator, updateMeValidator,
  updateMyPasswordValidator, updateMyFcmTokenValidator, updateMyPushPreferenceValidator, logHistoryValidator,
} from '../validators/userValidators.js';

const router = Router();

// Self-service routes — declared ahead of /:id so "me" is never captured as an id param.
router.patch('/me', requireAuth, imageUpload.single('avatar'), updateMeValidator, validate, userController.updateMe);
router.put('/me/password', requireAuth, updateMyPasswordValidator, validate, userController.updateMyPassword);
router.put('/me/fcm-token', requireAuth, updateMyFcmTokenValidator, validate, userController.updateMyFcmToken);
router.patch('/me/push-preference', requireAuth, updateMyPushPreferenceValidator, validate, userController.updateMyPushPreference);
router.get('/me/history', requireAuth, userController.listMyHistory);
router.post('/me/history', requireAuth, logHistoryValidator, validate, userController.logHistory);

// Admin user management
router.get('/', requireAuth, requireRole('admin', 'super_admin'), userController.list);
router.get('/:id', requireAuth, requireRole('admin', 'super_admin'), idParamValidator, validate, userController.getOne);
router.patch('/:id/role', requireAuth, requireRole('admin', 'super_admin'), updateRoleValidator, validate, userController.updateRole);
router.patch('/:id/status', requireAuth, requireRole('admin', 'super_admin'), updateStatusValidator, validate, userController.updateStatus);

export default router;
