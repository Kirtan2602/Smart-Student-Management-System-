import { body, query } from 'express-validator';

const phoneRule = (chain) =>
  chain
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[0-9+\-\s]{7,15}$/)
    .withMessage('Enter a valid phone number');

export const createTeacherRules = [
  body('email').trim().toLowerCase().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email').isLength({ max: 150 }).withMessage('Email is too long'),
  body('password')
    .isString().withMessage('Password is required')
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
    .withMessage('Password must be at least 8 characters with uppercase, lowercase and a number'),
  body('employeeCode').trim().notEmpty().withMessage('Employee code is required')
    .isLength({ max: 30 }).withMessage('Employee code is too long').toUpperCase(),
  body('firstName').trim().notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name is too long'),
  body('lastName').trim().notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name is too long'),
  phoneRule(body('phone')),
  body('designation').optional({ values: 'falsy' }).trim().isLength({ max: 100 }).withMessage('Designation is too long'),
  body('departmentId').isInt({ min: 1 }).withMessage('Select a department').toInt(),
];

export const updateTeacherRules = [
  body('email').optional().trim().toLowerCase().isEmail().withMessage('Enter a valid email')
    .isLength({ max: 150 }).withMessage('Email is too long'),
  body('employeeCode').optional().trim().notEmpty().withMessage('Employee code cannot be empty')
    .isLength({ max: 30 }).withMessage('Employee code is too long').toUpperCase(),
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty')
    .isLength({ max: 50 }).withMessage('First name is too long'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty')
    .isLength({ max: 50 }).withMessage('Last name is too long'),
  phoneRule(body('phone')),
  body('designation').optional({ values: 'falsy' }).trim().isLength({ max: 100 }).withMessage('Designation is too long'),
  body('departmentId').optional().isInt({ min: 1 }).withMessage('Select a department').toInt(),
];

export const listTeacherRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be 1 or more'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('departmentId').optional().isInt({ min: 1 }).withMessage('departmentId must be a positive integer'),
  query('isActive').optional().isIn(['true', 'false']).withMessage('isActive must be true or false'),
];

export const assignSubjectsRules = [
  body('subjectIds').isArray().withMessage('subjectIds must be an array'),
  body('subjectIds.*').isInt({ min: 1 }).withMessage('Each subject id must be a positive integer').toInt(),
  body('academicYearId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid academic year').toInt(),
];