import { body, query } from 'express-validator';

export const createUserRules = [
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email')
    .isLength({ max: 150 }).withMessage('Email is too long'),
  body('password')
    .isString().withMessage('Password is required')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
    .withMessage(
      'Password must be at least 8 characters with uppercase, lowercase and a number'
    ),
  // Teacher/Student account profile sathe Phase 6 ma banse. Atyare fakt ADMIN.
  body('role')
    .isIn(['ADMIN'])
    .withMessage('Only ADMIN accounts can be created here. Teacher/Student accounts are created with their profile in Phase 6'),
];

export const listUserRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be 1 or more'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(['ADMIN', 'TEACHER', 'STUDENT'])
    .withMessage('role must be ADMIN, TEACHER or STUDENT'),
];

export const userStatusRules = [
  body('isActive')
    .isBoolean().withMessage('isActive must be true or false')
    .toBoolean(),
];