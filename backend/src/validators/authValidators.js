import { body } from 'express-validator';

export const registerValidator = [
  body('fullName').trim().isLength({ min: 2, max: 120 }).withMessage('Full name must be 2-120 characters'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone').optional({ values: 'falsy' }).isMobilePhone('any').withMessage('Invalid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  body('acceptedTerms').toBoolean().equals('true')
    .withMessage('You must accept the Terms & Conditions to create an account'),
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const refreshValidator = [
  body('refreshToken').notEmpty().withMessage('refreshToken is required'),
];

export const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
];

export const resetPasswordValidator = [
  body('email').trim().isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
];
