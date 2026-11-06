import { body } from 'express-validator';

export const createSemesterRules = [
  body('number').isInt({ min: 1, max: 12 }).withMessage('Semester number must be between 1 and 12').toInt(),
  body('name').trim().notEmpty().withMessage('Semester name is required')
    .isLength({ max: 50 }).withMessage('Name is too long'),
];

export const updateSemesterRules = [
  body('number').optional().isInt({ min: 1, max: 12 }).withMessage('Semester number must be between 1 and 12').toInt(),
  body('name').optional().trim().notEmpty().withMessage('Semester name cannot be empty')
    .isLength({ max: 50 }).withMessage('Name is too long'),
];