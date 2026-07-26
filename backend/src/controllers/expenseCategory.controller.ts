import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { expenseCategoryService } from '../services/expenseCategory.service';
import { ApiError } from '../utils/ApiError';

export const expenseCategoryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const categories = await expenseCategoryService.list(req.user.userId);
    res.status(200).json({ success: true, data: categories });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const category = await expenseCategoryService.create(req.user.userId, req.body.name);
    res.status(201).json({ success: true, message: 'Expense category created', data: category });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const category = await expenseCategoryService.update(req.user.userId, req.params.id, req.body.name);
    res.status(200).json({ success: true, message: 'Expense category updated', data: category });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    await expenseCategoryService.remove(req.user.userId, req.params.id);
    res.status(200).json({ success: true, message: 'Expense category deleted' });
  }),
};
