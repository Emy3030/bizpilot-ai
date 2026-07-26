import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError';

export function validate(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: 'path' in e ? (e as { path: string }).path : undefined,
      message: e.msg,
    }));
    next(ApiError.badRequest('Validation failed', formatted));
    return;
  }
  next();
}
