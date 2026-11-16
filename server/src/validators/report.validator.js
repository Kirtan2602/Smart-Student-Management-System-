import { query } from 'express-validator';

const format = query('format').isIn(['csv', 'pdf']).withMessage('format must be csv or pdf');

const dateOnly = (chain) =>
  chain
    .isDate({ format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-'] })
    .withMessage('Date must be in YYYY-MM-DD format');

export const exportRules = [format];

export const subjectReportRules = [
  dateOnly(query('from').optional()),
  dateOnly(query('to').optional()),
];

export const subjectExportRules = [format, ...subjectReportRules];

export const semesterExportRules = [
  format,
  query('semesterId').isInt({ min: 1 }).withMessage('semesterId is required'),
  query('departmentId').isInt({ min: 1 }).withMessage('departmentId is required'),
  query('academicYearId').optional().isInt({ min: 1 }).withMessage('Invalid academic year'),
];

export const studentsExportRules = [
  format,
  query('departmentId').optional().isInt({ min: 1 }).withMessage('Invalid department'),
  query('semesterId').optional().isInt({ min: 1 }).withMessage('Invalid semester'),
  query('isActive').optional().isIn(['true', 'false']).withMessage('isActive must be true or false'),
];  