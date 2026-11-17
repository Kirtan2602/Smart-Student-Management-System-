import { body } from 'express-validator';

export const loginRules = [
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email'),
  body('password')
    .isString().withMessage('Password is required')
    .notEmpty().withMessage('Password is required'),
];

export const changePasswordRules = [
  body('currentPassword')
    .isString().withMessage('Current password is required')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isString().withMessage('New password is required')
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
    .withMessage('New password must be at least 8 characters with uppercase, lowercase and a number'),
];