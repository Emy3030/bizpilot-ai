import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token missing');
    }

    const token = header.split(' ')[1];
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}
