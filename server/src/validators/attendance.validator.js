import { body, query } from 'express-validator';

const dateOnly = (chain) =>
  chain
    .isDate({ format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-'] })
    .withMessage('Date must be in YYYY-MM-DD format');

export const sheetRules = [
  query('subjectId').isInt({ min: 1 }).withMessage('subjectId is required'),
  dateOnly(query('date')),
  query('lectureNo').optional().isInt({ min: 1, max: 10 }).withMessage('lectureNo must be between 1 and 10'),
];

export const saveRules = [
  body('subjectId').isInt({ min: 1 }).withMessage('Select a subject').toInt(),
  dateOnly(body('date')),
  body('lectureNo').optional().isInt({ min: 1, max: 10 }).withMessage('lectureNo must be between 1 and 10').toInt(),
  body('records').isArray({ min: 1 }).withMessage('At least one student record is required'),
  body('records.*.studentId').isInt({ min: 1 }).withMessage('Invalid student id').toInt(),
  body('records.*.status').isIn(['PRESENT', 'ABSENT']).withMessage('Status must be PRESENT or ABSENT'),
];

export const historyRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be 1 or more'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('subjectId').optional().isInt({ min: 1 }).withMessage('subjectId must be a positive integer'),
  dateOnly(query('from').optional()),
  dateOnly(query('to').optional()),
];

export const reportRules = [
  query('subjectId').isInt({ min: 1 }).withMessage('subjectId is required'),
  dateOnly(query('from').optional()),
  dateOnly(query('to').optional()),
  query('threshold').optional().isInt({ min: 1, max: 100 }).withMessage('threshold must be between 1 and 100'),
];