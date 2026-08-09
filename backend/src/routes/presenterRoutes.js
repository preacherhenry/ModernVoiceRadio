import { Router } from 'express';
import * as presenterController from '../controllers/presenterController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { imageUpload } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import {
  createPresenterValidator, updatePresenterValidator, idParamValidator,
} from '../validators/presenterValidators.js';

const router = Router();
const requireEditor = [requireAuth, requireRole('admin', 'super_admin', 'editor')];

router.get('/', presenterController.list);
router.get('/:idOrSlug', presenterController.getOne);

router.post(
  '/',
  ...requireEditor,
  imageUpload.single('photo'),
  createPresenterValidator,
  validate,
  presenterController.create,
);

router.put(
  '/:id',
  ...requireEditor,
  imageUpload.single('photo'),
  updatePresenterValidator,
  validate,
  presenterController.update,
);

router.delete('/:id', ...requireEditor, idParamValidator, validate, presenterController.remove);

export default router;
