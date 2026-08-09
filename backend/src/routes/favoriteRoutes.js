import { Router } from 'express';
import * as favoriteController from '../controllers/favoriteController.js';
import { requireAuth } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  addFavoriteValidator, removeFavoriteValidator, checkFavoriteValidator,
} from '../validators/favoriteValidators.js';

const router = Router();

router.get('/check', requireAuth, checkFavoriteValidator, validate, favoriteController.check);
router.get('/', requireAuth, favoriteController.list);
router.post('/', requireAuth, addFavoriteValidator, validate, favoriteController.add);
router.delete('/:entityType/:entityId', requireAuth, removeFavoriteValidator, validate, favoriteController.remove);

export default router;
