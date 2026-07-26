import { body, param, query } from 'express-validator';

export const createSaleValidator = [
  body('customerId').optional({ values: 'falsy' }).isString(),
  body('customerName').optional({ values: 'falsy' }).trim().isLength({ max: 200 }),
  body('customerPhone').optional({ values: 'falsy' }).trim().isLength({ max: 30 }),
  body('customerAddress').optional({ values: 'falsy' }).trim().isLength({ max: 300 }),
  body('paymentMethod').isIn(['CASH', 'TRANSFER', 'CARD', 'CREDIT']).withMessage('Invalid payment method'),
  body('amountPaid').isFloat({ min: 0 }).withMessage('Amount paid must be 0 or more'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').isString().notEmpty().withMessage('Each item needs a productId'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item quantity must be at least 1'),
];

export const listSalesValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('customerId').optional().trim(),
  query('paymentStatus').optional().isIn(['PAID', 'PARTIAL', 'UNPAID']),
];

export const saleIdValidator = [param('id').notEmpty()];

export const recordPaymentValidator = [
  param('id').notEmpty(),
  body('amount').isFloat({ gt: 0 }).withMessage('Payment amount must be greater than zero'),
];
