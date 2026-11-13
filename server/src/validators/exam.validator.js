import { body, query } from 'express-validator';

const EXAM_TYPES = ['UNIT_TEST', 'MID_TERM', 'INTERNAL', 'PRACTICAL', 'FINAL'];

// Passing marks, maximum marks thi vadhare na hoy
const passingNotAboveMax = (value, { req }) => {
  if (req.body.maxMarks !== undefined && value > Number(req.body.maxMarks)) {
    throw new Error('Passing marks cannot exceed maximum marks');
  }
  return true;
};

// Marks ma maximum 2 decimal
const twoDecimals = (value) => {
  if (Math.abs(value * 100 - Math.round(value * 100)) > 1e-6) {
    throw new Error('Marks can have at most 2 decimal places');
  }
  return true;
};

export const createExamRules = [
  body('name').trim().notEmpty().withMessage('Exam name is required')
    .isLength({ max: 100 }).withMessage('Exam name is too long'),
  body('type').isIn(EXAM_TYPES).withMessage('Select a valid exam type'),
  body('subjectId').isInt({ min: 1 }).withMessage('Select a subject').toInt(),
  body('maxMarks').isInt({ min: 1, max: 500 }).withMessage('Maximum marks must be between 1 and 500').toInt(),
  body('passingMarks').optional({ values: 'null' })
    .isInt({ min: 0 }).withMessage('Passing marks must be 0 or more').toInt()
    .custom(passingNotAboveMax),
  body('examDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid exam date'),
];

export const updateExamRules = [
  body('name').optional().trim().notEmpty().withMessage('Exam name cannot be empty')
    .isLength({ max: 100 }).withMessage('Exam name is too long'),
  body('type').optional().isIn(EXAM_TYPES).withMessage('Select a valid exam type'),
  body('maxMarks').optional().isInt({ min: 1, max: 500 }).withMessage('Maximum marks must be between 1 and 500').toInt(),
  body('passingMarks').optional({ values: 'null' })
    .isInt({ min: 0 }).withMessage('Passing marks must be 0 or more').toInt()
    .custom(passingNotAboveMax),
  body('examDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid exam date'),
];

export const listExamRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be 1 or more'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('subjectId').optional().isInt({ min: 1 }).withMessage('subjectId must be a positive integer'),
  query('academicYearId').optional().isInt({ min: 1 }).withMessage('academicYearId must be a positive integer'),
  query('type').optional().isIn(EXAM_TYPES).withMessage('Invalid exam type'),
  query('isPublished').optional().isIn(['true', 'false']).withMessage('isPublished must be true or false'),
];

export const publishRules = [
  body('isPublished').isBoolean().withMessage('isPublished must be true or false').toBoolean(),
];

export const saveMarksRules = [
  body('marks').isArray({ min: 1 }).withMessage('At least one student mark is required'),
  body('marks.*.studentId').isInt({ min: 1 }).withMessage('Invalid student id').toInt(),
  body('marks.*.obtainedMarks')
    .isFloat({ min: 0 }).withMessage('Marks must be a number (0 or more)').toFloat()
    .custom(twoDecimals),
];