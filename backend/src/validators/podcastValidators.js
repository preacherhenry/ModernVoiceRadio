import { body, param } from 'express-validator';

export const idParamValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
];

export const podcastIdParamValidator = [
  param('podcastId').isUUID().withMessage('A valid podcastId is required'),
];

export const createPodcastValidator = [
  body('title').trim().isLength({ min: 2, max: 180 }).withMessage('Title must be 2-180 characters'),
  body('slug').optional().trim().isLength({ min: 2, max: 200 }),
  body('description').optional({ values: 'falsy' }).isString(),
  body('categoryId').optional({ values: 'falsy' }).isUUID(),
  body('presenterId').optional({ values: 'falsy' }).isUUID(),
  body('isFeatured').optional().toBoolean().isBoolean(),
];

export const updatePodcastValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
  body('title').optional().trim().isLength({ min: 2, max: 180 }),
  body('slug').optional().trim().isLength({ min: 2, max: 200 }),
  body('description').optional({ values: 'falsy' }).isString(),
  body('categoryId').optional({ values: 'falsy' }).isUUID(),
  body('presenterId').optional({ values: 'falsy' }).isUUID(),
  body('isFeatured').optional().toBoolean().isBoolean(),
  body('isActive').optional().toBoolean().isBoolean(),
];

export const createEpisodeValidator = [
  param('podcastId').isUUID().withMessage('A valid podcastId is required'),
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be 2-200 characters'),
  body('description').optional({ values: 'falsy' }).isString(),
  body('durationSeconds').optional().toInt().isInt({ min: 0 }),
  body('episodeNumber').optional().toInt().isInt({ min: 0 }),
  body('seasonNumber').optional().toInt().isInt({ min: 0 }),
  body('isPublished').optional().toBoolean().isBoolean(),
];

export const updateEpisodeValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
  body('title').optional().trim().isLength({ min: 2, max: 200 }),
  body('description').optional({ values: 'falsy' }).isString(),
  body('durationSeconds').optional().toInt().isInt({ min: 0 }),
  body('episodeNumber').optional().toInt().isInt({ min: 0 }),
  body('seasonNumber').optional().toInt().isInt({ min: 0 }),
  body('isPublished').optional().toBoolean().isBoolean(),
];

export const playEpisodeValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
];

export const progressValidator = [
  param('id').isUUID().withMessage('A valid episode id is required'),
  body('positionSeconds').isInt({ min: 0 }).withMessage('positionSeconds must be a non-negative integer'),
  body('isCompleted').optional().toBoolean().isBoolean(),
];
