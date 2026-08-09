import { Router } from 'express';
import * as downloadController from '../controllers/downloadController.js';
import { requireAuth } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { addDownloadValidator, downloadIdParamValidator } from '../validators/downloadValidators.js';

const router = Router();

router.get('/', requireAuth, downloadController.list);
router.post('/', requireAuth, addDownloadValidator, validate, downloadController.add);
router.delete('/:id', requireAuth, downloadIdParamValidator, validate, downloadController.remove);

export default router;
