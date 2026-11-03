import { body, query } from 'express-validator';

export const createSubjectRules = [
  body('code')
    .trim()
    .notEmpty().withMessage('Subject code is required')
    .isLength({ max: 20 }).withMessage('Code must be at most 20 characters')
    .toUpperCase(),
  body('name')
    .trim()
    .notEmpty().withMessage('Subject name is required')
    .isLength({ max: 150 }).withMessage('Name must be at most 150 characters'),
  body('departmentId')
    .isInt({ min: 1 }).withMessage('departmentId must be a positive integer')
    .toInt(),
  body('semesterId')
    .isInt({ min: 1 }).withMessage('semesterId must be a positive integer')
    .toInt(),
];

export const updateSubjectRules = [
  body('code')
    .optional()
    .trim()
    .notEmpty().withMessage('Code cannot be empty')
    .isLength({ max: 20 }).withMessage('Code must be at most 20 characters')
    .toUpperCase(),
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 150 }).withMessage('Name must be at most 150 characters'),
  body('departmentId')
    .optional()
    .isInt({ min: 1 }).withMessage('departmentId must be a positive integer')
    .toInt(),
  body('semesterId')
    .optional()
    .isInt({ min: 1 }).withMessage('semesterId must be a positive integer')
    .toInt(),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be true or false'),
];

export const listSubjectRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be 1 or more'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  query('departmentId').optional().isInt({ min: 1 }).withMessage('departmentId must be a positive integer'),
  query('semesterId').optional().isInt({ min: 1 }).withMessage('semesterId must be a positive integer'),
];