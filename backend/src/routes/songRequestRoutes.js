import { Router } from 'express';
import * as songRequestController from '../controllers/songRequestController.js';
import { optionalAuth, requireAuth, requireRole } from '../middlewares/auth.js';
import { writeLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import {
  createSongRequestValidator, listSongRequestsValidator, updateSongRequestStatusValidator,
} from '../validators/songRequestValidators.js';

const router = Router();

router.post('/', writeLimiter, optionalAuth, createSongRequestValidator, validate, songRequestController.create);
router.get(
  '/',
  requireAuth,
  requireRole('moderator', 'admin', 'super_admin'),
  listSongRequestsValidator,
  validate,
  songRequestController.list,
);
router.patch(
  '/:id/status',
  requireAuth,
  requireRole('moderator', 'admin', 'super_admin'),
  updateSongRequestStatusValidator,
  validate,
  songRequestController.updateStatus,
);

export default router;
