import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyService } from '../services/verify.service';

export const verifyController = {
  byHash: asyncHandler(async (req: Request, res: Response) => {
    const result = await verifyService.verifyByHash(req.params.hash);
    res.status(200).json({ success: true, data: result });
  }),
};
