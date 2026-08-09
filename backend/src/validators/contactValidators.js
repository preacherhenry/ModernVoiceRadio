import { body } from 'express-validator';

export const updateContactValidator = [
  body('stationName').optional({ values: 'falsy' }).isString().isLength({ max: 150 }),
  body('phone').optional({ values: 'falsy' }).isString().isLength({ max: 30 }),
  body('whatsapp').optional({ values: 'falsy' }).isString().isLength({ max: 30 }),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email').normalizeEmail(),
  body('address').optional({ values: 'falsy' }).isString(),
  body('latitude').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }),
  body('longitude').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 }),
  body('facebookUrl').optional({ values: 'falsy' }).isURL(),
  body('instagramUrl').optional({ values: 'falsy' }).isURL(),
  body('tiktokUrl').optional({ values: 'falsy' }).isURL(),
  body('youtubeUrl').optional({ values: 'falsy' }).isURL(),
  body('twitterUrl').optional({ values: 'falsy' }).isURL(),
  body('websiteUrl').optional({ values: 'falsy' }).isURL(),
];
