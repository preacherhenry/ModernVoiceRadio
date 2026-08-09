import { Router } from 'express';
import * as settingsController from '../controllers/settingsController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { updateSettingValidator } from '../validators/settingsValidators.js';

const router = Router();

router.get('/', settingsController.list);

router.put(
  '/:key',
  requireAuth,
  requireRole('admin', 'super_admin'),
  updateSettingValidator,
  validate,
  settingsController.update,
);

export default router;
