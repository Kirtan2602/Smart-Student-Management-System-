import { body } from 'express-validator';

const endAfterStart = (value, { req }) => {
  if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
    throw new Error('End date must be after start date');
  }
  return true;
};

export const createAcademicYearRules = [
  body('name').trim().notEmpty().withMessage('Name is required (example: 2026-27)')
    .isLength({ max: 20 }).withMessage('Name is too long'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required').custom(endAfterStart),
  body('isCurrent').optional().isBoolean().withMessage('isCurrent must be true or false').toBoolean(),
];

export const updateAcademicYearRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 20 }).withMessage('Name is too long'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date').custom(endAfterStart),
  body('isCurrent').optional().isBoolean().withMessage('isCurrent must be true or false').toBoolean(),
];