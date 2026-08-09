import { body, param, query } from 'express-validator';
import { ENTITY_TYPES } from '../repositories/favoriteRepository.js';

export const addFavoriteValidator = [
  body('entityType').isIn(ENTITY_TYPES).withMessage(`entityType must be one of: ${ENTITY_TYPES.join(', ')}`),
  body('entityId').isUUID().withMessage('entityId must be a valid UUID'),
];

export const removeFavoriteValidator = [
  param('entityType').isIn(ENTITY_TYPES).withMessage(`entityType must be one of: ${ENTITY_TYPES.join(', ')}`),
  param('entityId').isUUID().withMessage('entityId must be a valid UUID'),
];

export const checkFavoriteValidator = [
  query('entityType').isIn(ENTITY_TYPES).withMessage(`entityType must be one of: ${ENTITY_TYPES.join(', ')}`),
  query('entityId').isUUID().withMessage('entityId must be a valid UUID'),
];
