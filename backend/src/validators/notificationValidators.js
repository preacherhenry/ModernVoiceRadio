import { body, param } from 'express-validator';

const TYPES = ['breaking_news', 'live_show', 'new_podcast', 'announcement'];

export const createNotificationValidator = [
  body('title').trim().isLength({ min: 1, max: 180 }).withMessage('Title is required (max 180 chars)'),
  body('body').trim().isLength({ min: 1 }).withMessage('Body is required'),
  body('type').optional().isIn(TYPES).withMessage(`type must be one of: ${TYPES.join(', ')}`),
  body('imageUrl').optional({ values: 'falsy' }).isURL().withMessage('imageUrl must be a valid URL'),
  body('data').optional().isObject().withMessage('data must be an object'),
  body('targetTopic').optional().trim().isLength({ min: 1, max: 60 }).withMessage('targetTopic must be 1-60 characters'),
];

export const notificationIdParamValidator = [
  param('id').isUUID().withMessage('Invalid notification id'),
];
