import { Router } from 'express';
import * as scheduleController from '../controllers/scheduleController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { writeLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import {
  createScheduleValidator, updateScheduleValidator, idParamValidator, reminderParamValidator,
} from '../validators/scheduleValidators.js';

const router = Router();
const requireEditor = [requireAuth, requireRole('admin', 'super_admin', 'editor')];

router.get('/weekly', scheduleController.weekly);
router.get('/today', scheduleController.today);
router.get('/reminders/mine', requireAuth, scheduleController.myReminders);

router.post('/', ...requireEditor, createScheduleValidator, validate, scheduleController.create);
router.put('/:id', ...requireEditor, updateScheduleValidator, validate, scheduleController.update);
router.delete('/:id', ...requireEditor, idParamValidator, validate, scheduleController.remove);

router.post(
  '/:id/reminder',
  requireAuth,
  writeLimiter,
  reminderParamValidator,
  validate,
  scheduleController.addReminder,
);
router.delete(
  '/:id/reminder',
  requireAuth,
  reminderParamValidator,
  validate,
  scheduleController.removeReminder,
);

export default router;
