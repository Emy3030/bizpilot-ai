import { body, param, query } from 'express-validator';

export const listExpensesValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('categoryId').optional().trim(),
  query('from').optional().isISO8601().withMessage('from must be a valid date'),
  query('to').optional().isISO8601().withMessage('to must be a valid date'),
];

export const createExpenseValidator = [
  body('title').trim().notEmpty().withMessage('Expense title is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than zero'),
  body('categoryId').optional({ values: 'falsy' }).isString(),
  body('note').optional({ values: 'falsy' }).trim(),
];

export const updateExpenseValidator = [
  param('id').notEmpty(),
  body('title').optional().trim().notEmpty().withMessage('Expense title cannot be empty'),
  body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be greater than zero'),
  body('categoryId').optional({ values: 'falsy' }).isString(),
  body('note').optional({ values: 'falsy' }).trim(),
];

export const expenseIdValidator = [param('id').notEmpty()];
