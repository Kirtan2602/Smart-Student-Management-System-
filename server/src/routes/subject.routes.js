import { Router } from 'express';
import * as controller from '../controllers/subject.controller.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { idParam } from '../validators/common.validator.js';
import {
  createSubjectRules,
  updateSubjectRules,
  listSubjectRules,
} from '../validators/subject.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', listSubjectRules, validate, controller.listSubjects);
router.get('/:id', idParam, validate, controller.getSubject);

router.post('/', authorize('ADMIN'), createSubjectRules, validate, controller.createSubject);
router.put('/:id', authorize('ADMIN'), idParam, updateSubjectRules, validate, controller.updateSubject);
router.delete('/:id', authorize('ADMIN'), idParam, validate, controller.deleteSubject);

export default router;