import { body, param, query } from 'express-validator';

const STATUSES = ['pending', 'approved', 'played', 'rejected'];

export const createSongRequestValidator = [
  body('requesterName').trim().isLength({ min: 2, max: 120 }).withMessage('Requester name must be 2-120 characters'),
  body('songTitle').trim().isLength({ min: 1, max: 200 }).withMessage('Song title is required'),
  body('artistName').trim().isLength({ min: 1, max: 200 }).withMessage('Artist name is required'),
  body('message').optional({ values: 'falsy' }).trim().isLength({ max: 500 }).withMessage('Message must be under 500 characters'),
];

export const listSongRequestsValidator = [
  query('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`),
];

export const updateSongRequestStatusValidator = [
  param('id').isUUID().withMessage('Invalid song request id'),
  body('status').isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`),
];
