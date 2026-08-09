import newsRepository from '../repositories/newsRepository.js';
import ApiError from '../utils/ApiError.js';
import slugify from '../utils/slugify.js';
import cloudinary from '../config/cloudinary.js';
import logger from '../config/logger.js';

const isAdminLike = (user) => !!user && ['admin', 'super_admin', 'editor'].includes(user.roleName);

/** multer's original file.mimetype (not Cloudinary's detected resource_type) tells us image vs video. */
const toMediaItems = (files = []) => files.map((file) => ({
  mediaType: file.mimetype?.startsWith('video') ? 'video' : 'image',
  mediaUrl: file.path,
  mediaPublicId: file.filename,
}));

export const newsService = {
  listCategories: async () => newsRepository.listCategories(),

  list: async (listQuery, user) => newsRepository.list({
    ...listQuery,
    includeUnpublished: isAdminLike(user),
  }),

  getOne: async (idOrSlug, user) => {
    const article = await newsRepository.findDetailByIdOrSlug(idOrSlug, isAdminLike(user));
    if (!article) throw ApiError.notFound('News article not found');
    await newsRepository.incrementViewCount(article.id);
    const media = await newsRepository.listMedia(article.id);
    return { ...article, view_count: article.view_count + 1, media };
  },

  create: async (data, authorId, files = {}) => {
    let { slug } = data;
    if (!slug) slug = slugify(data.title);
    const existing = await newsRepository.findBySlug(slug);
    if (existing) throw ApiError.conflict('A news article with this slug already exists');

    const cover = files.cover?.[0];
    const article = await newsRepository.create({
      ...data,
      slug,
      authorId,
      coverImageUrl: cover ? cover.path : undefined,
      coverPublicId: cover ? cover.filename : undefined,
    });

    const mediaFiles = files.media ?? [];
    const media = mediaFiles.length ? await newsRepository.addMedia(article.id, toMediaItems(mediaFiles)) : [];
    return { ...article, media };
  },

  update: async (id, data, files = {}) => {
    const existing = await newsRepository.findById(id);
    if (!existing) throw ApiError.notFound('News article not found');

    if (data.slug && data.slug !== existing.slug) {
      const clash = await newsRepository.findBySlug(data.slug);
      if (clash) throw ApiError.conflict('A news article with this slug already exists');
    }

    const cover = files.cover?.[0];
    const updated = await newsRepository.update(id, {
      ...data,
      coverImageUrl: cover ? cover.path : undefined,
      coverPublicId: cover ? cover.filename : undefined,
    });

    // Additional media files on an update are appended, not a replacement of
    // whatever's already attached — removal is a separate, explicit action.
    const mediaFiles = files.media ?? [];
    if (mediaFiles.length) await newsRepository.addMedia(id, toMediaItems(mediaFiles));
    const media = await newsRepository.listMedia(id);
    return { ...updated, media };
  },

  removeMedia: async (newsId, mediaId) => {
    const media = await newsRepository.findMediaById(mediaId);
    if (!media || media.news_id !== newsId) throw ApiError.notFound('Media item not found on this article');

    await newsRepository.removeMedia(mediaId);

    if (media.media_public_id) {
      try {
        await cloudinary.uploader.destroy(media.media_public_id, {
          resource_type: media.media_type === 'video' ? 'video' : 'image',
        });
      } catch (err) {
        // The DB record is already gone — a failed Cloudinary cleanup shouldn't fail
        // the request, just leave an orphaned asset that can be cleared out later.
        logger.warn(`Failed to delete Cloudinary asset ${media.media_public_id}: ${err.message}`);
      }
    }
  },

  remove: async (id) => {
    const existing = await newsRepository.findById(id);
    if (!existing) throw ApiError.notFound('News article not found');
    await newsRepository.remove(id);
  },
};

export default newsService;
