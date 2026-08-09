import { Router } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import * as galleryController from '../controllers/galleryController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { createGalleryValidator, idParamValidator } from '../validators/galleryValidators.js';

const router = Router();
const requireEditor = [requireAuth, requireRole('admin', 'super_admin', 'editor')];

/**
 * Gallery items can be either a photo or a video. Rather than branching multer
 * instances on the `mediaType` body field (unreliable — multipart fields after the
 * file part aren't guaranteed to be parsed yet when the storage engine runs), we use
 * a single uploader with resource_type "auto" and let Cloudinary detect the file kind.
 * The `mediaType` the client sends is only used for our own DB categorization.
 */
const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'mvradio/gallery', resource_type: 'auto' },
});
const galleryUpload = multer({ storage: galleryStorage, limits: { fileSize: 100 * 1024 * 1024 } });

router.get('/', galleryController.list);

router.post(
  '/',
  ...requireEditor,
  galleryUpload.single('media'),
  createGalleryValidator,
  validate,
  galleryController.create,
);

router.delete('/:id', ...requireEditor, idParamValidator, validate, galleryController.remove);

export default router;
