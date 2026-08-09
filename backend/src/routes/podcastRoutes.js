import { Router } from 'express';
import * as podcastController from '../controllers/podcastController.js';
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth.js';
import { imageUpload, episodeUpload } from '../middlewares/upload.js';
import { writeLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import {
  createPodcastValidator, updatePodcastValidator, idParamValidator, podcastIdParamValidator,
  createEpisodeValidator, updateEpisodeValidator, playEpisodeValidator, progressValidator,
} from '../validators/podcastValidators.js';

const router = Router();
const requireEditor = [requireAuth, requireRole('admin', 'super_admin', 'editor')];

// --- Static/literal routes first so they aren't swallowed by "/:idOrSlug" -----

router.get('/categories', podcastController.listCategories);
router.get('/progress/continue-listening', requireAuth, podcastController.continueListening);

router.put(
  '/episodes/:id/progress',
  requireAuth,
  writeLimiter,
  progressValidator,
  validate,
  podcastController.updateProgress,
);
router.post(
  '/episodes/:id/play',
  optionalAuth,
  writeLimiter,
  playEpisodeValidator,
  validate,
  podcastController.playEpisode,
);
router.put(
  '/episodes/:id',
  ...requireEditor,
  episodeUpload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  updateEpisodeValidator,
  validate,
  podcastController.updateEpisode,
);
router.delete('/episodes/:id', ...requireEditor, idParamValidator, validate, podcastController.removeEpisode);

// --- Podcasts ------------------------------------------------------------------

router.get('/', podcastController.list);
router.get('/:idOrSlug', podcastController.getOne);

router.post(
  '/',
  ...requireEditor,
  imageUpload.single('cover'),
  createPodcastValidator,
  validate,
  podcastController.create,
);
router.put(
  '/:id',
  ...requireEditor,
  imageUpload.single('cover'),
  updatePodcastValidator,
  validate,
  podcastController.update,
);
router.delete('/:id', ...requireEditor, idParamValidator, validate, podcastController.remove);

// --- Nested episodes -------------------------------------------------------------

router.get('/:podcastId/episodes', podcastIdParamValidator, validate, podcastController.listEpisodes);
router.post(
  '/:podcastId/episodes',
  ...requireEditor,
  episodeUpload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  createEpisodeValidator,
  validate,
  podcastController.createEpisode,
);

export default router;
