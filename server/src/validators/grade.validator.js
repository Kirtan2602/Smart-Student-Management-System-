import { body } from 'express-validator';

export const createGradeRules = [
  body('grade').trim().notEmpty().withMessage('Grade is required')
    .isLength({ max: 5 }).withMessage('Grade must be at most 5 characters'),
  body('minPercent').isFloat({ min: 0, max: 100 }).withMessage('Minimum percentage must be between 0 and 100').toFloat(),
  body('gradePoint').isFloat({ min: 0, max: 10 }).withMessage('Grade point must be between 0 and 10').toFloat(),
];

export const updateGradeRules = [
  body('grade').optional().trim().notEmpty().withMessage('Grade cannot be empty')
    .isLength({ max: 5 }).withMessage('Grade must be at most 5 characters'),
  body('minPercent').optional().isFloat({ min: 0, max: 100 }).withMessage('Minimum percentage must be between 0 and 100').toFloat(),
  body('gradePoint').optional().isFloat({ min: 0, max: 10 }).withMessage('Grade point must be between 0 and 10').toFloat(),
];