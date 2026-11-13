import { Router } from 'express';
import * as controller from '../controllers/exam.controller.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { idParam } from '../validators/common.validator.js';
import {
  createExamRules,
  updateExamRules,
  listExamRules,
  publishRules,
  saveMarksRules,
} from '../validators/exam.validator.js';

const router = Router();

// Admin + Teacher (teacher no subject-level check service ma chhe). Student ne access nathi.
router.use(authenticate, authorize('ADMIN', 'TEACHER'));

router.get('/', listExamRules, validate, controller.list);
router.post('/', createExamRules, validate, controller.create);
router.get('/:id', idParam, validate, controller.get);
router.put('/:id', idParam, updateExamRules, validate, controller.update);
router.delete('/:id', idParam, validate, controller.remove);
router.patch('/:id/publish', idParam, publishRules, validate, controller.publish);
router.get('/:id/marks', idParam, validate, controller.marksSheet);
router.put('/:id/marks', idParam, saveMarksRules, validate, controller.saveMarks);

export default router;