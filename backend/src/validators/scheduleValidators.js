import { body, param } from 'express-validator';

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

export const idParamValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
];

export const createScheduleValidator = [
  body('programId').isUUID().withMessage('A valid programId is required'),
  body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('dayOfWeek must be between 0 (Sunday) and 6 (Saturday)'),
  body('startTime').matches(timePattern).withMessage('startTime must be in HH:MM format'),
  body('endTime').matches(timePattern).withMessage('endTime must be in HH:MM format')
    .custom((value, { req }) => {
      if (req.body.startTime && value <= req.body.startTime) {
        throw new Error('endTime must be later than startTime');
      }
      return true;
    }),
  body('timezone').optional({ values: 'falsy' }).isString(),
];

export const updateScheduleValidator = [
  param('id').isUUID().withMessage('A valid id is required'),
  body('programId').optional().isUUID(),
  body('dayOfWeek').optional().isInt({ min: 0, max: 6 }).withMessage('dayOfWeek must be between 0 (Sunday) and 6 (Saturday)'),
  body('startTime').optional().matches(timePattern).withMessage('startTime must be in HH:MM format'),
  body('endTime').optional().matches(timePattern).withMessage('endTime must be in HH:MM format')
    .custom((value, { req }) => {
      if (req.body.startTime && value <= req.body.startTime) {
        throw new Error('endTime must be later than startTime');
      }
      return true;
    }),
  body('timezone').optional({ values: 'falsy' }).isString(),
  body('isActive').optional().toBoolean().isBoolean(),
];

export const reminderParamValidator = [
  param('id').isUUID().withMessage('A valid schedule id is required'),
];
