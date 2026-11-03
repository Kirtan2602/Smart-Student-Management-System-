import { param } from 'express-validator';

// URL ma aavto :id positive number hovo joie
export const idParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer')
    .toInt(),
];