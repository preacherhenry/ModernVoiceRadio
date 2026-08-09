import { Router } from 'express';
import * as newsController from '../controllers/newsController.js';
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth.js';
import { newsMediaUpload } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import {
  createNewsValidator, updateNewsValidator, idParamValidator, mediaParamValidator,
} from '../validators/newsValidators.js';

const router = Router();
const requireEditor = [requireAuth, requireRole('admin', 'super_admin', 'editor')];

// A single `cover` image plus an optional `media[]` array (up to 10 extra
// images/videos) attached to the same multipart request.
const newsUploadFields = newsMediaUpload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'media', maxCount: 10 },
]);

router.get('/categories', newsController.listCategories);
router.get('/', optionalAuth, newsController.list);
router.get('/:idOrSlug', optionalAuth, newsController.getOne);

router.post(
  '/',
  ...requireEditor,
  newsUploadFields,
  createNewsValidator,
  validate,
  newsController.create,
);
router.put(
  '/:id',
  ...requireEditor,
  newsUploadFields,
  updateNewsValidator,
  validate,
  newsController.update,
);
router.delete(
  '/:id/media/:mediaId',
  ...requireEditor,
  mediaParamValidator,
  validate,
  newsController.removeMedia,
);
router.delete('/:id', ...requireEditor, idParamValidator, validate, newsController.remove);

export default router;
