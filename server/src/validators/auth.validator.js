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