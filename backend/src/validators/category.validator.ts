import { body, param } from 'express-validator';

export const categoryNameValidator = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
];

export const categoryIdValidator = [param('id').notEmpty()];
