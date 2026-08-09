import { Router } from 'express';
import * as contactController from '../controllers/contactController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { updateContactValidator } from '../validators/contactValidators.js';

const router = Router();

router.get('/', contactController.get);

router.put(
  '/',
  requireAuth,
  requireRole('admin', 'super_admin'),
  updateContactValidator,
  validate,
  contactController.update,
);

export default router;
