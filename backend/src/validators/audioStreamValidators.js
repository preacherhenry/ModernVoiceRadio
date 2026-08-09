import { body, param, query } from 'express-validator';

const PROTOCOLS = ['icecast', 'shoutcast', 'hls'];
const FORMATS = ['mp3', 'aac', 'ogg'];

export const createAudioStreamValidator = [
  body('name').trim().isLength({ min: 1, max: 120 }).withMessage('Name is required (max 120 chars)'),
  body('url').trim().isURL().withMessage('A valid stream URL is required'),
  body('protocol').optional().isIn(PROTOCOLS).withMessage(`protocol must be one of: ${PROTOCOLS.join(', ')}`),
  body('format').optional().isIn(FORMATS).withMessage(`format must be one of: ${FORMATS.join(', ')}`),
  body('bitrateKbps').optional().isInt({ min: 1 }).withMessage('bitrateKbps must be a positive integer'),
  body('metadataUrl').optional({ values: 'falsy' }).isURL().withMessage('metadataUrl must be a valid URL'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('displayOrder').optional().isInt().withMessage('displayOrder must be an integer'),
];

export const updateAudioStreamValidator = [
  param('id').isUUID().withMessage('Invalid stream id'),
  body('name').optional().trim().isLength({ min: 1, max: 120 }).withMessage('Name must be 1-120 characters'),
  body('url').optional().trim().isURL().withMessage('A valid stream URL is required'),
  body('protocol').optional().isIn(PROTOCOLS).withMessage(`protocol must be one of: ${PROTOCOLS.join(', ')}`),
  body('format').optional().isIn(FORMATS).withMessage(`format must be one of: ${FORMATS.join(', ')}`),
  body('bitrateKbps').optional().isInt({ min: 1 }).withMessage('bitrateKbps must be a positive integer'),
  body('metadataUrl').optional({ values: 'falsy' }).isURL().withMessage('metadataUrl must be a valid URL'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('displayOrder').optional().isInt().withMessage('displayOrder must be an integer'),
];

export const streamIdParamValidator = [
  param('id').isUUID().withMessage('Invalid stream id'),
];

export const nowPlayingValidator = [
  query('streamId').optional().isUUID().withMessage('Invalid streamId'),
];
