import { Router } from 'express';
import * as advertisementController from '../controllers/advertisementController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { imageUpload } from '../middlewares/upload.js';
import { writeLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import {
  createAdvertisementValidator, updateAdvertisementValidator, idParamValidator,
} from '../validators/advertisementValidators.js';

const router = Router();
const requireAdmin = [requireAuth, requireRole('admin', 'super_admin')];

router.get('/active', advertisementController.active);

router.post('/:id/impression', writeLimiter, idParamValidator, validate, advertisementController.impression);
router.post('/:id/click', writeLimiter, idParamValidator, validate, advertisementController.click);

router.get('/', ...requireAdmin, advertisementController.list);

router.post(
  '/',
  ...requireAdmin,
  imageUpload.single('image'),
  createAdvertisementValidator,
  validate,
  advertisementController.create,
);
router.put(
  '/:id',
  ...requireAdmin,
  imageUpload.single('image'),
  updateAdvertisementValidator,
  validate,
  advertisementController.update,
);
router.delete('/:id', ...requireAdmin, idParamValidator, validate, advertisementController.remove);

export default router;
