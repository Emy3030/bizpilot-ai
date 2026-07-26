import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { categoryService } from '../services/category.service';
import { ApiError } from '../utils/ApiError';

export const categoryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const categories = await categoryService.list(req.user.userId);
    res.status(200).json({ success: true, data: categories });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const category = await categoryService.create(req.user.userId, req.body.name);
    res.status(201).json({ success: true, message: 'Category created', data: category });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const category = await categoryService.update(req.user.userId, req.params.id, req.body.name);
    res.status(200).json({ success: true, message: 'Category updated', data: category });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    await categoryService.remove(req.user.userId, req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted' });
  }),
};
