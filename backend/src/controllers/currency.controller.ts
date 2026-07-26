import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { currencyService } from '../services/currency.service';

export const currencyController = {
  rates: asyncHandler(async (req: Request, res: Response) => {
    const target = typeof req.query.target === 'string' ? req.query.target : 'NGN';
    const result = await currencyService.getRates(target);

    if (!result) {
      res.status(200).json({ success: true, data: { available: false, target: target.toUpperCase(), rates: [] } });
      return;
    }

    res.status(200).json({ success: true, data: { available: true, ...result } });
  }),
};
