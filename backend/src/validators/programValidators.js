import { body, param } from 'express-validator';

export const idParamValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
];

export const createProgramValidator = [
  body('title').trim().isLength({ min: 2, max: 150 }).withMessage('Title must be 2-150 characters'),
  body('slug').optional().trim().isLength({ min: 2, max: 180 }),
  body('description').optional({ values: 'falsy' }).isString(),
  body('category').optional({ values: 'falsy' }).isString().isLength({ max: 80 }),
  body('presenterIds').optional(),
];

export const updateProgramValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
  body('title').optional().trim().isLength({ min: 2, max: 150 }),
  body('slug').optional().trim().isLength({ min: 2, max: 180 }),
  body('description').optional({ values: 'falsy' }).isString(),
  body('category').optional({ values: 'falsy' }).isString().isLength({ max: 80 }),
  body('isActive').optional().toBoolean().isBoolean(),
  body('presenterIds').optional(),
];
