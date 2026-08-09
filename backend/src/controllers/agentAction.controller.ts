import { Request, Response } from 'express';
import { AgentActionStatus } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { agentActionService } from '../services/agentAction.service';
import { ApiError } from '../utils/ApiError';

const VALID_STATUSES: AgentActionStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'FAILED'];

function parseStatus(value: unknown): AgentActionStatus | undefined {
  if (typeof value !== 'string') return undefined;
  const upper = value.toUpperCase();
  return (VALID_STATUSES as string[]).includes(upper) ? (upper as AgentActionStatus) : undefined;
}

export const agentActionController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const status = parseStatus(req.query.status);
    const actions = await agentActionService.list(req.user.userId, status);
    res.status(200).json({ success: true, data: actions });
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const action = await agentActionService.approve(req.user.userId, req.params.id);
    res.status(200).json({ success: true, message: 'Action approved and executed', data: action });
  }),

  reject: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const action = await agentActionService.reject(req.user.userId, req.params.id);
    res.status(200).json({ success: true, message: 'Action rejected', data: action });
  }),
};
