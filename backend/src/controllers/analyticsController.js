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

const periodQuery = (req) => ({
  period: req.query.period,
  from: req.query.from,
  to: req.query.to,
});

export const listenerSummary = asyncHandler(async (req, res) => {
  const data = await analyticsService.listenerSummary(periodQuery(req));
  sendSuccess(res, 200, 'Listener summary retrieved', data);
});

export const listenerBreakdown = asyncHandler(async (req, res) => {
  const { rows, total } = await analyticsService.listenerBreakdown({
    ...periodQuery(req),
    sortBy: req.query.sortBy,
    limit: Math.min(Number(req.query.limit) || 50, 200),
    offset: Number(req.query.offset) || 0,
  });
  sendSuccess(res, 200, 'Listeners retrieved', rows, { total });
});

export const listenerHistory = asyncHandler(async (req, res) => {
  const data = await analyticsService.listenerHistory({
    ...periodQuery(req),
    userId: req.params.userId,
    limit: Math.min(Number(req.query.limit) || 100, 500),
    offset: Number(req.query.offset) || 0,
  });
  sendSuccess(res, 200, 'Listener history retrieved', data);
});
