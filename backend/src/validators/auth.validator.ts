import { body } from 'express-validator';

export const registerValidator = [
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const updateProfileValidator = [
  body('businessName').optional().trim().notEmpty().withMessage('Business name cannot be empty'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('currency').optional().trim().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('New password must contain at least one number'),
];
