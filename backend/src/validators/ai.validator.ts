import { body, query } from 'express-validator';

export const chatMessageValidator = [
  body('message').trim().notEmpty().withMessage('Message cannot be empty').isLength({ max: 2000 }).withMessage('Message is too long'),
];

export const historyQueryValidator = [query('limit').optional().isInt({ min: 1, max: 200 }).toInt()];
