import { query } from 'express-validator';

export const listNotificationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be 1 or more'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
  query('unreadOnly').optional().isIn(['true', 'false']).withMessage('unreadOnly must be true or false'),
];