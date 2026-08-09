import { body, param } from 'express-validator';

const socialsChain = body('socials')
  .optional()
  .customSanitizer((value) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return value; }
    }
    return value;
  })
  .custom((value) => {
    if (value === undefined) return true;
    if (typeof value !== 'object' || Array.isArray(value) || value === null) {
      throw new Error('socials must be an object');
    }
    const allowed = ['instagram', 'twitter', 'facebook', 'tiktok'];
    Object.entries(value).forEach(([key, val]) => {
      if (!allowed.includes(key)) throw new Error(`socials.${key} is not a recognized field`);
      if (val !== undefined && val !== null && typeof val !== 'string') {
        throw new Error(`socials.${key} must be a string`);
      }
    });
    return true;
  });

export const idParamValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
];

export const createPresenterValidator = [
  body('fullName').trim().isLength({ min: 2, max: 120 }).withMessage('Full name must be 2-120 characters'),
  body('slug').optional().trim().isLength({ min: 2, max: 150 }).withMessage('Slug must be 2-150 characters'),
  body('bio').optional({ values: 'falsy' }).isString(),
  body('roleTitle').optional({ values: 'falsy' }).isString().isLength({ max: 100 }),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email').normalizeEmail(),
  body('phone').optional({ values: 'falsy' }).isString().isLength({ max: 30 }),
  socialsChain,
  body('isFeatured').optional().toBoolean().isBoolean(),
  body('displayOrder').optional().toInt().isInt(),
];

export const updatePresenterValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
  body('fullName').optional().trim().isLength({ min: 2, max: 120 }),
  body('slug').optional().trim().isLength({ min: 2, max: 150 }),
  body('bio').optional({ values: 'falsy' }).isString(),
  body('roleTitle').optional({ values: 'falsy' }).isString().isLength({ max: 100 }),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email').normalizeEmail(),
  body('phone').optional({ values: 'falsy' }).isString().isLength({ max: 30 }),
  socialsChain,
  body('isFeatured').optional().toBoolean().isBoolean(),
  body('isActive').optional().toBoolean().isBoolean(),
  body('displayOrder').optional().toInt().isInt(),
];
