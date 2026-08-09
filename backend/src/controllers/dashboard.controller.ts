import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { dashboardService } from '../services/dashboard.service';
import { ApiError } from '../utils/ApiError';

export const dashboardController = {
  summary: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const summary = await dashboardService.getSummary(req.user.userId);
    res.status(200).json({ success: true, data: summary });
  }),

  missionControl: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const summary = await dashboardService.getMissionControl(req.user.userId);
    res.status(200).json({ success: true, data: summary });
  }),
};
