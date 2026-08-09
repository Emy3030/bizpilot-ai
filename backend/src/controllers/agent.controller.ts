import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { agentService } from '../services/agent.service';
import { ApiError } from '../utils/ApiError';

export const agentController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const agents = await agentService.getAgents(req.user.userId);
    res.status(200).json({ success: true, data: agents });
  }),
};
