import { query } from 'express-validator';

const yearRule = query('academicYearId')
  .optional()
  .isInt({ min: 1 })
  .withMessage('academicYearId must be a positive integer');

export const myResultRules = [yearRule];

export const subjectResultRules = [
  query('subjectId').isInt({ min: 1 }).withMessage('subjectId is required'),
  yearRule,
];

export const semesterResultRules = [
  query('semesterId').isInt({ min: 1 }).withMessage('semesterId is required'),
  query('departmentId').isInt({ min: 1 }).withMessage('departmentId is required'),
  yearRule,
];