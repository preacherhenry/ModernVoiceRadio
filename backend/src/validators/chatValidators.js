import { body, param, query } from 'express-validator';

export const listMessagesValidator = [
  query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
];

export const messageIdParamValidator = [
  param('id').isUUID().withMessage('Invalid message id'),
];

export const pinMessageValidator = [
  param('id').isUUID().withMessage('Invalid message id'),
  body('isPinned').isBoolean().withMessage('isPinned must be a boolean'),
];

export const banValidator = [
  body('userId').isUUID().withMessage('userId must be a valid UUID'),
  body('reason').optional({ values: 'falsy' }).trim().isLength({ max: 300 }).withMessage('reason must be under 300 characters'),
  body('expiresAt').optional({ values: 'falsy' }).isISO8601().withMessage('expiresAt must be a valid date'),
];

export const unbanValidator = [
  param('userId').isUUID().withMessage('Invalid user id'),
];

export const lockStateValidator = [
  body('locked').isBoolean().withMessage('locked must be a boolean'),
];

export const sendMessageValidator = [
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('message must be 1-1000 characters'),
];
