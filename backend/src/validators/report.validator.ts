import { query } from 'express-validator';

export const reportSummaryValidator = [
  query('period').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('period must be daily, weekly or monthly'),
  query('date').optional().isISO8601().withMessage('date must be a valid ISO date'),
];
