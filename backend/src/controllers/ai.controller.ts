import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { aiService } from '../services/ai.service';
import { ApiError } from '../utils/ApiError';

export const aiController = {
  chat: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await aiService.chat(req.user.userId, req.body.message);
    res.status(200).json({ success: true, data: result });
  }),

  history: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const limit = Number(req.query.limit) || 50;
    const messages = await aiService.getHistory(req.user.userId, limit);
    res.status(200).json({ success: true, data: messages });
  }),

  clearHistory: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    await aiService.clearHistory(req.user.userId);
    res.status(200).json({ success: true, message: 'Conversation cleared' });
  }),
};
