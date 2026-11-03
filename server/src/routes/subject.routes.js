import { Router } from 'express';
import * as controller from '../controllers/subject.controller.js';
import validate from '../middleware/validate.js';
import { idParam } from '../validators/common.validator.js';
import {
  createSubjectRules,
  updateSubjectRules,
  listSubjectRules,
} from '../validators/subject.validator.js';

const router = Router();

router.get('/', listSubjectRules, validate, controller.listSubjects);
router.get('/:id', idParam, validate, controller.getSubject);
router.post('/', createSubjectRules, validate, controller.createSubject);
router.put('/:id', idParam, updateSubjectRules, validate, controller.updateSubject);
router.delete('/:id', idParam, validate, controller.deleteSubject);

export default router;