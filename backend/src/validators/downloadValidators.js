import { body, param } from 'express-validator';

export const addDownloadValidator = [
  body('episodeId').isUUID().withMessage('episodeId must be a valid UUID'),
  body('fileSizeBytes').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('fileSizeBytes must be a non-negative integer'),
];

export const downloadIdParamValidator = [
  param('id').isUUID().withMessage('Invalid download id'),
];
