import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authService } from '../services/auth.service';
import { ApiError } from '../utils/ApiError';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { businessName, name, email, password } = req.body;
    const result = await authService.register({ businessName, name, email, password });
    res.status(201).json({ success: true, message: 'Account created successfully', data: result });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json({ success: true, message: 'Logged in successfully', data: result });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const user = await authService.getProfile(req.user.userId);
    res.status(200).json({ success: true, data: user });
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const { businessName, name, currency } = req.body;
    const user = await authService.updateProfile(req.user.userId, { businessName, name, currency });
    res.status(200).json({ success: true, message: 'Profile updated', data: user });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.userId, currentPassword, newPassword);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  }),
};
