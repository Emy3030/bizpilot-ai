import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { invoiceService } from '../services/invoice.service';
import { ApiError } from '../utils/ApiError';

export const invoiceController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await invoiceService.list(req.user.userId, { page, limit });
    res.status(200).json({ success: true, data: result.invoices, meta: result.meta });
  }),
};
