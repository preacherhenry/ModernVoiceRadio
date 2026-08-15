import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

/**
 * Builds a multer middleware that streams uploads directly to a Cloudinary folder.
 * @param {string} folder e.g. "mvradio/presenters"
 * @param {string[]} allowedFormats
 * @param {'image'|'video'|'auto'} resourceType
 */
export const makeUploader = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'webp'], resourceType = 'image') => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `mvradio/${folder}`,
      allowed_formats: allowedFormats,
      resource_type: resourceType,
    },
  });
  return multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });
};

export const imageUpload = makeUploader('images');
export const audioUpload = makeUploader('audio', ['mp3', 'wav', 'm4a', 'aac'], 'video'); // Cloudinary treats audio under "video"
export const videoUpload = makeUploader('videos', ['mp4', 'mov', 'webm'], 'video');

/**
 * Handles podcast episode uploads carrying two possible fields in the same multipart
 * request — a required `audio` file and an optional `cover` image — each routed to the
 * correct Cloudinary folder/resource type based on fieldname. Used with `.fields([...])`.
 */
const episodeStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => (
    file.fieldname === 'cover'
      ? { folder: 'mvradio/images', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], resource_type: 'image' }
      : { folder: 'mvradio/audio', allowed_formats: ['mp3', 'wav', 'm4a', 'aac'], resource_type: 'video' }
  ),
});
export const episodeUpload = multer({ storage: episodeStorage, limits: { fileSize: 50 * 1024 * 1024 } });

/**
 * Handles news article uploads carrying two possible fields — a single `cover` image
 * and an optional `media[]` array of additional images/videos for the article body.
 * `media` uses resource_type "auto" (like galleryRoutes.js) since it can be a mix of
 * photos and videos in the same request. Used with `.fields([...])`.
 */
const newsMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => (
    file.fieldname === 'cover'
      ? { folder: 'mvradio/images', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], resource_type: 'image' }
      : { folder: 'mvradio/news-media', resource_type: 'auto' }
  ),
});
export const newsMediaUpload = multer({ storage: newsMediaStorage, limits: { fileSize: 100 * 1024 * 1024 } });

/**
 * Handles advertisement uploads carrying the required `image` (the main poster shown in
 * the home banner) plus up to four optional `supporting` pictures for the details
 * gallery. Both are plain images; the poster keeps living in mvradio/images so existing
 * adverts' URLs stay untouched, while supporting pictures get their own folder.
 * Used with `.fields([...])`.
 */
const advertisementStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => (
    file.fieldname === 'image'
      ? { folder: 'mvradio/images', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], resource_type: 'image' }
      : { folder: 'mvradio/ad-media', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], resource_type: 'image' }
  ),
});
export const advertisementUpload = multer({ storage: advertisementStorage, limits: { fileSize: 50 * 1024 * 1024 } });
