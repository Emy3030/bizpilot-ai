import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { saleService } from '../services/sale.service';
import { ApiError } from '../utils/ApiError';

export const saleController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const sale = await saleService.create(req.user.userId, req.body);
    res.status(201).json({ success: true, message: 'Sale recorded', data: sale });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const customerId = typeof req.query.customerId === 'string' ? req.query.customerId : undefined;
    const paymentStatus =
      typeof req.query.paymentStatus === 'string'
        ? (req.query.paymentStatus as 'PAID' | 'PARTIAL' | 'UNPAID')
        : undefined;

    const result = await saleService.list(req.user.userId, { page, limit, customerId, paymentStatus });
    res.status(200).json({ success: true, data: result.sales, meta: result.meta });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const sale = await saleService.getById(req.user.userId, req.params.id);
    res.status(200).json({ success: true, data: sale });
  }),

  recordPayment: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const sale = await saleService.recordPayment(req.user.userId, req.params.id, Number(req.body.amount));
    res.status(200).json({ success: true, message: 'Payment recorded', data: sale });
  }),

  generateInvoice: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const invoice = await saleService.generateInvoice(req.user.userId, req.params.id);
    res.status(201).json({ success: true, message: 'Invoice generated', data: invoice });
  }),

  generateReceipt: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const receipt = await saleService.generateReceipt(req.user.userId, req.params.id);
    res.status(201).json({ success: true, message: 'Receipt generated', data: receipt });
  }),
};
