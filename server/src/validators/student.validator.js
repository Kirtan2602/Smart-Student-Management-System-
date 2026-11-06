import { body, query } from 'express-validator';

const strongPassword = body('password')
  .isString().withMessage('Password is required')
  .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
  .withMessage('Password must be at least 8 characters with uppercase, lowercase and a number');

const phoneRule = (chain) =>
  chain
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[0-9+\-\s]{7,15}$/)
    .withMessage('Enter a valid phone number');

export const createStudentRules = [
  body('email').trim().toLowerCase().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email').isLength({ max: 150 }).withMessage('Email is too long'),
  strongPassword,
  body('enrollmentNo').trim().notEmpty().withMessage('Enrollment number is required')
    .isLength({ max: 30 }).withMessage('Enrollment number is too long').toUpperCase(),
  body('firstName').trim().notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name is too long'),
  body('lastName').trim().notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name is too long'),
  phoneRule(body('phone')),
  body('gender').optional({ values: 'falsy' }).isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('dateOfBirth').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid date of birth'),
  body('address').optional({ values: 'falsy' }).trim().isLength({ max: 255 }).withMessage('Address is too long'),
  body('departmentId').isInt({ min: 1 }).withMessage('Select a department').toInt(),
  body('semesterId').isInt({ min: 1 }).withMessage('Select a semester').toInt(),
  body('academicYearId').isInt({ min: 1 }).withMessage('Select an academic year').toInt(),
];

export const updateStudentRules = [
  body('email').optional().trim().toLowerCase().isEmail().withMessage('Enter a valid email')
    .isLength({ max: 150 }).withMessage('Email is too long'),
  body('enrollmentNo').optional().trim().notEmpty().withMessage('Enrollment number cannot be empty')
    .isLength({ max: 30 }).withMessage('Enrollment number is too long').toUpperCase(),
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty')
    .isLength({ max: 50 }).withMessage('First name is too long'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty')
    .isLength({ max: 50 }).withMessage('Last name is too long'),
  phoneRule(body('phone')),
  body('gender').optional({ values: 'falsy' }).isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('dateOfBirth').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid date of birth'),
  body('address').optional({ values: 'falsy' }).trim().isLength({ max: 255 }).withMessage('Address is too long'),
  body('departmentId').optional().isInt({ min: 1 }).withMessage('Select a department').toInt(),
  body('semesterId').optional().isInt({ min: 1 }).withMessage('Select a semester').toInt(),
  body('academicYearId').optional().isInt({ min: 1 }).withMessage('Select an academic year').toInt(),
];

export const listStudentRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be 1 or more'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('departmentId').optional().isInt({ min: 1 }).withMessage('departmentId must be a positive integer'),
  query('semesterId').optional().isInt({ min: 1 }).withMessage('semesterId must be a positive integer'),
  query('academicYearId').optional().isInt({ min: 1 }).withMessage('academicYearId must be a positive integer'),
  query('isActive').optional().isIn(['true', 'false']).withMessage('isActive must be true or false'),
];