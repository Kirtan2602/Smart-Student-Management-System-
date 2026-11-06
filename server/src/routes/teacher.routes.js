import { Router } from 'express';
import * as controller from '../controllers/teacher.controller.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { idParam } from '../validators/common.validator.js';
import { userStatusRules } from '../validators/user.validator.js';
import {
  createTeacherRules,
  updateTeacherRules,
  listTeacherRules,
  assignSubjectsRules,
} from '../validators/teacher.validator.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', listTeacherRules, validate, controller.listTeachers);
router.get('/:id', idParam, validate, controller.getTeacher);
router.post('/', createTeacherRules, validate, controller.createTeacher);
router.put('/:id', idParam, updateTeacherRules, validate, controller.updateTeacher);
router.patch('/:id/status', idParam, userStatusRules, validate, controller.updateTeacherStatus);
router.put('/:id/subjects', idParam, assignSubjectsRules, validate, controller.assignSubjects);

export default router;