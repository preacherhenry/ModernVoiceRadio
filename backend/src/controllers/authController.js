import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import authService from '../services/authService.js';

const requestMeta = (req) => ({ userAgent: req.headers['user-agent'], ipAddress: req.ip });

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body, requestMeta(req));
  sendSuccess(res, 201, 'Account created successfully', result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, requestMeta(req));
  sendSuccess(res, 200, 'Logged in successfully', result);
});

export const refresh = asyncHandler(async (req, res) => {
  const tokens = await authService.refresh(req.body.refreshToken, requestMeta(req));
  sendSuccess(res, 200, 'Token refreshed', tokens);
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  sendSuccess(res, 200, 'Logged out successfully');
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user.id);
  sendSuccess(res, 200, 'Current user', user);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  // Response is identical whether or not the email exists, by design.
  sendSuccess(res, 200, 'If an account exists for this email, a reset code has been sent.');
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  sendSuccess(res, 200, 'Password reset successfully — please log in again.');
});
