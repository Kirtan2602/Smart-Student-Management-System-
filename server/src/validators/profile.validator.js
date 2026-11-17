import { body } from 'express-validator';

export const updateProfileRules = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty')
    .isLength({ max: 50 }).withMessage('First name is too long'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty')
    .isLength({ max: 50 }).withMessage('Last name is too long'),
  body('phone').optional({ values: 'falsy' }).trim()
    .matches(/^[0-9+\-\s]{7,15}$/).withMessage('Enter a valid phone number'),
  body('address').optional({ values: 'falsy' }).trim()
    .isLength({ max: 255 }).withMessage('Address is too long'),
];