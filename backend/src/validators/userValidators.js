import { body, param } from 'express-validator';

const ROLE_NAMES = ['super_admin', 'admin', 'editor', 'moderator', 'listener'];

export const idParamValidator = [
  param('id').isUUID().withMessage('Invalid user id'),
];

export const updateRoleValidator = [
  param('id').isUUID().withMessage('Invalid user id'),
  body('roleName').isIn(ROLE_NAMES).withMessage(`roleName must be one of: ${ROLE_NAMES.join(', ')}`),
];

export const updateStatusValidator = [
  param('id').isUUID().withMessage('Invalid user id'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
];

export const updateMeValidator = [
  body('fullName').optional().trim().isLength({ min: 2, max: 120 }).withMessage('Full name must be 2-120 characters'),
  body('phone').optional({ values: 'falsy' }).isMobilePhone('any').withMessage('Invalid phone number'),
  body('preferredLanguage').optional().trim().isLength({ min: 2, max: 10 }).withMessage('Invalid preferred language'),
  body('themePreference').optional().isIn(['dark', 'light', 'system']).withMessage('Invalid theme preference'),
];

export const updateMyPasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
];

export const updateMyFcmTokenValidator = [
  body('fcmToken').trim().notEmpty().withMessage('fcmToken is required'),
];

export const updateMyPushPreferenceValidator = [
  body('pushEnabled').isBoolean().withMessage('pushEnabled must be a boolean'),
];

export const logHistoryValidator = [
  body('entityType').isIn(['live', 'episode']).withMessage('entityType must be live or episode'),
  body('entityId').optional({ values: 'falsy' }).isUUID().withMessage('Invalid entityId'),
  body('durationSeconds').isInt({ min: 0 }).withMessage('durationSeconds must be a non-negative integer'),
  body('deviceType').optional({ values: 'falsy' }).isIn(['ios', 'android', 'web']).withMessage('Invalid deviceType'),
];
