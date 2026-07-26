import { body, param } from 'express-validator';

export const expenseCategoryNameValidator = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
];

export const expenseCategoryIdValidator = [param('id').notEmpty()];
