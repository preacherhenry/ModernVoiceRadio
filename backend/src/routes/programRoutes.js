import { Router } from 'express';
import * as programController from '../controllers/programController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { imageUpload } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import {
  createProgramValidator, updateProgramValidator, idParamValidator,
} from '../validators/programValidators.js';

const router = Router();
const requireEditor = [requireAuth, requireRole('admin', 'super_admin', 'editor')];

router.get('/', programController.list);
router.get('/:idOrSlug', programController.getOne);

router.post(
  '/',
  ...requireEditor,
  imageUpload.single('cover'),
  createProgramValidator,
  validate,
  programController.create,
);

router.put(
  '/:id',
  ...requireEditor,
  imageUpload.single('cover'),
  updateProgramValidator,
  validate,
  programController.update,
);

router.delete('/:id', ...requireEditor, idParamValidator, validate, programController.remove);

export default router;
