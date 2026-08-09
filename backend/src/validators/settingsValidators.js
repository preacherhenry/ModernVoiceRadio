import { body, param } from 'express-validator';

export const updateSettingValidator = [
  param('key').trim().isLength({ min: 1, max: 100 }).withMessage('A valid settings key is required'),
  body('value').exists().withMessage('value is required'),
  body('description').optional({ values: 'falsy' }).isString(),
];
