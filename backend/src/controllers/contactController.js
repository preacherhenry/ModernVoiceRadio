import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import contactService from '../services/contactService.js';

export const get = asyncHandler(async (req, res) => {
  const contact = await contactService.get();
  sendSuccess(res, 200, 'Contact information retrieved', contact);
});

export const update = asyncHandler(async (req, res) => {
  const contact = await contactService.upsert(req.body);
  sendSuccess(res, 200, 'Contact information updated', contact);
});
