import { body, param } from 'express-validator';

export const idParamValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
];

export const createAdvertisementValidator = [
  body('title').trim().isLength({ min: 2, max: 180 }).withMessage('Title must be 2-180 characters'),
  body('targetUrl').optional({ values: 'falsy' }).isURL().withMessage('targetUrl must be a valid URL'),
  body('placement').optional({ values: 'falsy' }).isIn(['home_banner', 'interstitial', 'news_inline']),
  body('startDate').optional({ values: 'falsy' }).isISO8601(),
  body('endDate').optional({ values: 'falsy' }).isISO8601(),
  body('isActive').optional().toBoolean().isBoolean(),
  body('displayOrder').optional().toInt().isInt(),
  body('description').optional({ values: 'falsy' }).isString().isLength({ max: 2000 }),
  body('contactPhone').optional({ values: 'falsy' }).isString().isLength({ max: 30 }),
  body('contactWhatsapp').optional({ values: 'falsy' }).isString().isLength({ max: 30 }),
  body('contactEmail').optional({ values: 'falsy' }).isEmail().withMessage('contactEmail must be a valid email'),
  body('contactAddress').optional({ values: 'falsy' }).isString().isLength({ max: 500 }),
];

export const updateAdvertisementValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
  body('title').optional().trim().isLength({ min: 2, max: 180 }),
  body('targetUrl').optional({ values: 'falsy' }).isURL().withMessage('targetUrl must be a valid URL'),
  body('placement').optional({ values: 'falsy' }).isIn(['home_banner', 'interstitial', 'news_inline']),
  body('startDate').optional({ values: 'falsy' }).isISO8601(),
  body('endDate').optional({ values: 'falsy' }).isISO8601(),
  body('isActive').optional().toBoolean().isBoolean(),
  body('displayOrder').optional().toInt().isInt(),
  body('description').optional({ values: 'falsy' }).isString().isLength({ max: 2000 }),
  body('contactPhone').optional({ values: 'falsy' }).isString().isLength({ max: 30 }),
  body('contactWhatsapp').optional({ values: 'falsy' }).isString().isLength({ max: 30 }),
  body('contactEmail').optional({ values: 'falsy' }).isEmail().withMessage('contactEmail must be a valid email'),
  body('contactAddress').optional({ values: 'falsy' }).isString().isLength({ max: 500 }),
];
