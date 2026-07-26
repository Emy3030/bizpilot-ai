import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { customerService } from '../services/customer.service';
import { ApiError } from '../utils/ApiError';

export const customerController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    const result = await customerService.list(req.user.userId, { search, page, limit });
    res.status(200).json({ success: true, data: result.customers, meta: result.meta });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const customer = await customerService.create(req.user.userId, req.body);
    res.status(201).json({ success: true, message: 'Customer added', data: customer });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const customer = await customerService.getById(req.user.userId, req.params.id);
    res.status(200).json({ success: true, data: customer });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const customer = await customerService.update(req.user.userId, req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Customer updated', data: customer });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    await customerService.remove(req.user.userId, req.params.id);
    res.status(200).json({ success: true, message: 'Customer deleted' });
  }),
};
