import { body, param } from 'express-validator';

export const idParamValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
];

export const createGalleryValidator = [
  body('title').optional({ values: 'falsy' }).isString().isLength({ max: 180 }),
  body('mediaType').isIn(['photo', 'video']).withMessage('mediaType must be "photo" or "video"'),
  body('eventName').optional({ values: 'falsy' }).isString().isLength({ max: 180 }),
  body('eventDate').optional({ values: 'falsy' }).isISO8601().withMessage('eventDate must be a valid date'),
  body('displayOrder').optional().toInt().isInt(),
];
