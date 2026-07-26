import { body, param, query } from 'express-validator';

export const listProductsValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().trim(),
  query('categoryId').optional().trim(),
  query('lowStockOnly').optional().isBoolean(),
];

export const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('costPrice').notEmpty().withMessage('Cost price is required').bail().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('sellingPrice').notEmpty().withMessage('Selling price is required').bail().isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a positive whole number'),
  body('lowStockThreshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be a positive whole number'),
];

export const updateProductValidator = [
  param('id').notEmpty(),
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('costPrice').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('sellingPrice').optional().isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a positive whole number'),
  body('lowStockThreshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be a positive whole number'),
];

export const productIdValidator = [param('id').notEmpty()];
