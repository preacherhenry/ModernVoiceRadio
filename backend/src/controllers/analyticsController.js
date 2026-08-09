import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import analyticsService from '../services/analyticsService.js';

export const overview = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const data = await analyticsService.overview(io);
  sendSuccess(res, 200, 'Analytics overview retrieved', data);
});

export const countries = asyncHandler(async (req, res) => {
  const data = await analyticsService.countries();
  sendSuccess(res, 200, 'Listener countries retrieved', data);
});

export const cities = asyncHandler(async (req, res) => {
  const data = await analyticsService.cities();
  sendSuccess(res, 200, 'Listener cities retrieved', data);
});

export const devices = asyncHandler(async (req, res) => {
  const data = await analyticsService.devices();
  sendSuccess(res, 200, 'Listener devices retrieved', data);
});

export const trend = asyncHandler(async (req, res) => {
  const days = Math.min(365, Math.max(1, parseInt(req.query.days, 10) || 30));
  const data = await analyticsService.trend(days);
  sendSuccess(res, 200, 'Analytics trend retrieved', data);
});
