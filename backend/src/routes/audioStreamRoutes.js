import { Router } from 'express';
import * as audioStreamController from '../controllers/audioStreamController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  createAudioStreamValidator, updateAudioStreamValidator, streamIdParamValidator, nowPlayingValidator,
} from '../validators/audioStreamValidators.js';

const router = Router();

router.get('/now-playing', nowPlayingValidator, validate, audioStreamController.nowPlaying);
router.get('/active', audioStreamController.getActive);
router.get('/', audioStreamController.list);

router.post(
  '/',
  requireAuth,
  requireRole('admin', 'super_admin'),
  createAudioStreamValidator,
  validate,
  audioStreamController.create,
);
router.put(
  '/:id',
  requireAuth,
  requireRole('admin', 'super_admin'),
  updateAudioStreamValidator,
  validate,
  audioStreamController.update,
);
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin', 'super_admin'),
  streamIdParamValidator,
  validate,
  audioStreamController.remove,
);

export default router;
