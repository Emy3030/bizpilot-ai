import { body, param, query } from 'express-validator';

export const listCustomersValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().trim(),
];

export const createCustomerValidator = [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  body('phone').optional({ values: 'falsy' }).trim(),
  body('email').optional({ values: 'falsy' }).trim().isEmail().withMessage('Enter a valid email'),
  body('address').optional({ values: 'falsy' }).trim(),
];

export const updateCustomerValidator = [
  param('id').notEmpty(),
  body('name').optional().trim().notEmpty().withMessage('Customer name cannot be empty'),
  body('phone').optional({ values: 'falsy' }).trim(),
  body('email').optional({ values: 'falsy' }).trim().isEmail().withMessage('Enter a valid email'),
  body('address').optional({ values: 'falsy' }).trim(),
];

export const customerIdValidator = [param('id').notEmpty()];
