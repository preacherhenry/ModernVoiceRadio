import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import audioStreamService from '../services/audioStreamService.js';

export const list = asyncHandler(async (req, res) => {
  const streams = await audioStreamService.listActive();
  sendSuccess(res, 200, 'Audio streams retrieved', streams);
});

export const getActive = asyncHandler(async (req, res) => {
  const stream = await audioStreamService.getActiveDefault();
  sendSuccess(res, 200, 'Default stream retrieved', stream);
});

export const nowPlaying = asyncHandler(async (req, res) => {
  const info = await audioStreamService.getNowPlaying(req.query.streamId);
  sendSuccess(res, 200, 'Now playing retrieved', info);
});

export const create = asyncHandler(async (req, res) => {
  const stream = await audioStreamService.create(req.body);
  sendSuccess(res, 201, 'Audio stream created', stream);
});

export const update = asyncHandler(async (req, res) => {
  const stream = await audioStreamService.update(req.params.id, req.body);
  sendSuccess(res, 200, 'Audio stream updated', stream);
});

export const remove = asyncHandler(async (req, res) => {
  await audioStreamService.remove(req.params.id);
  sendSuccess(res, 200, 'Audio stream deleted');
});
