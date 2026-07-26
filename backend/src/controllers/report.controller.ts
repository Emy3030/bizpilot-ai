import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { reportService, ReportPeriod } from '../services/report.service';
import { ApiError } from '../utils/ApiError';

export const reportController = {
  summary: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();

    const period = (typeof req.query.period === 'string' ? req.query.period : 'daily') as ReportPeriod;
    const dateParam = typeof req.query.date === 'string' ? new Date(req.query.date) : new Date();
    const referenceDate = Number.isNaN(dateParam.getTime()) ? new Date() : dateParam;

    const summary = await reportService.getSummary(req.user.userId, period, referenceDate);
    res.status(200).json({ success: true, data: summary });
  }),
};
