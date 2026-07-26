import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { expenseService } from '../services/expense.service';
import { ApiError } from '../utils/ApiError';

export const expenseController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
    const from = typeof req.query.from === 'string' ? new Date(req.query.from) : undefined;
    const to = typeof req.query.to === 'string' ? new Date(req.query.to) : undefined;

    const result = await expenseService.list(req.user.userId, { page, limit, categoryId, from, to });
    res.status(200).json({
      success: true,
      data: result.expenses,
      meta: result.meta,
      totalAmount: result.totalAmount,
    });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const { title, amount, categoryId, note } = req.body;
    const expense = await expenseService.create(req.user.userId, {
      title,
      amount: Number(amount),
      categoryId,
      note,
    });
    res.status(201).json({ success: true, message: 'Expense recorded', data: expense });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const { title, amount, categoryId, note } = req.body;
    const expense = await expenseService.update(req.user.userId, req.params.id, {
      title,
      amount: amount !== undefined ? Number(amount) : undefined,
      categoryId,
      note,
    });
    res.status(200).json({ success: true, message: 'Expense updated', data: expense });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    await expenseService.remove(req.user.userId, req.params.id);
    res.status(200).json({ success: true, message: 'Expense deleted' });
  }),

  summary: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const summary = await expenseService.getSummary(req.user.userId);
    res.status(200).json({ success: true, data: summary });
  }),
};
