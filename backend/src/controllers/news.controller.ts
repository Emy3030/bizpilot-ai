import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { newsService } from '../services/news.service';

export const newsController = {
  businessHeadlines: asyncHandler(async (_req: Request, res: Response) => {
    const configured = newsService.isConfigured();
    const articles = configured ? await newsService.getBusinessHeadlines() : [];
    res.status(200).json({ success: true, data: { configured, articles } });
  }),
};
