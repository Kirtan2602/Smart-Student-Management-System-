import { body, query } from 'express-validator';

export const createDepartmentRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Department name is required')
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
  body('code')
    .trim()
    .notEmpty().withMessage('Department code is required')
    .isLength({ max: 10 }).withMessage('Code must be at most 10 characters')
    .toUpperCase(),
];

export const updateDepartmentRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
  body('code')
    .optional()
    .trim()
    .notEmpty().withMessage('Code cannot be empty')
    .isLength({ max: 10 }).withMessage('Code must be at most 10 characters')
    .toUpperCase(),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be true or false'),
];

export const listDepartmentRules = [
  query('isActive')
    .optional()
    .isIn(['true', 'false']).withMessage('isActive must be true or false'),
];