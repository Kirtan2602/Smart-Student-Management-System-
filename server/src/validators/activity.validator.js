import { query } from 'express-validator';

const dateOnly = (chain) =>
  chain
    .isDate({ format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-'] })
    .withMessage('Date must be in YYYY-MM-DD format');

export const listActivityRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be 1 or more'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('action').optional().trim().isLength({ max: 50 }).withMessage('Action is too long'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search text is too long'),
  dateOnly(query('from').optional()),
  dateOnly(query('to').optional()),
];