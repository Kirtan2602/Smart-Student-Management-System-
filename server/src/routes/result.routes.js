import { Router } from 'express';
import * as controller from '../controllers/result.controller.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  myResultRules,
  subjectResultRules,
  semesterResultRules,
} from '../validators/result.validator.js';

const router = Router();

router.use(authenticate);

router.get('/my', authorize('STUDENT'), myResultRules, validate, controller.my);
router.get('/subject', authorize('ADMIN', 'TEACHER'), subjectResultRules, validate, controller.subject);
router.get('/semester', authorize('ADMIN'), semesterResultRules, validate, controller.semester);

export default router;