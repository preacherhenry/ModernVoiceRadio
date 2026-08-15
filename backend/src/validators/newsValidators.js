import { body, param } from 'express-validator';

export const idParamValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
];

export const mediaParamValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
  param('mediaId').isUUID().withMessage('A valid mediaId is required'),
];

export const createNewsValidator = [
  body('title').trim().isLength({ min: 2, max: 220 }).withMessage('Title must be 2-220 characters'),
  body('slug').optional().trim().isLength({ min: 2, max: 250 }),
  body('excerpt').optional({ values: 'falsy' }).isString().isLength({ max: 500 }),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('categoryId').optional({ values: 'falsy' }).isUUID(),
  body('isBreaking').optional().toBoolean().isBoolean(),
  body('isTrending').optional().toBoolean().isBoolean(),
  body('isPublished').optional().toBoolean().isBoolean(),
  body('reporterName').optional({ values: 'null' }).isString().isLength({ max: 160 })
    .withMessage('reporterName must be at most 160 characters'),
  body('reportDate').optional({ values: 'null' }).custom((v) => v === '' || !Number.isNaN(Date.parse(v)))
    .withMessage('reportDate must be a valid date'),
];

export const updateNewsValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
  body('title').optional().trim().isLength({ min: 2, max: 220 }),
  body('slug').optional().trim().isLength({ min: 2, max: 250 }),
  body('excerpt').optional({ values: 'falsy' }).isString().isLength({ max: 500 }),
  body('content').optional().trim().notEmpty(),
  body('categoryId').optional({ values: 'falsy' }).isUUID(),
  body('isBreaking').optional().toBoolean().isBoolean(),
  body('isTrending').optional().toBoolean().isBoolean(),
  body('isPublished').optional().toBoolean().isBoolean(),
  body('reporterName').optional({ values: 'null' }).isString().isLength({ max: 160 })
    .withMessage('reporterName must be at most 160 characters'),
  body('reportDate').optional({ values: 'null' }).custom((v) => v === '' || !Number.isNaN(Date.parse(v)))
    .withMessage('reportDate must be a valid date'),
];
