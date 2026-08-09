import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import searchService from '../services/searchService.js';

export const search = asyncHandler(async (req, res) => {
  const results = await searchService.search(req.query.q, req.query.types);
  sendSuccess(res, 200, 'Search results retrieved', results);
});
