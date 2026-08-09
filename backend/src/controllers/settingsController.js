import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import settingsService from '../services/settingsService.js';

export const list = asyncHandler(async (req, res) => {
  const settings = await settingsService.getAll();
  sendSuccess(res, 200, 'Settings retrieved', settings);
});

export const update = asyncHandler(async (req, res) => {
  const result = await settingsService.set(req.params.key, req.body.value, req.body.description);
  sendSuccess(res, 200, 'Setting updated', result);
});
