import { Router } from 'express';
import * as controller from '../controllers/student.controller.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { idParam } from '../validators/common.validator.js';
import { userStatusRules } from '../validators/user.validator.js';
import {
  createStudentRules,
  updateStudentRules,
  listStudentRules,
} from '../validators/student.validator.js';

const router = Router();

// Student management fakt ADMIN mate
router.use(authenticate, authorize('ADMIN'));

router.get('/', listStudentRules, validate, controller.listStudents);
router.get('/:id', idParam, validate, controller.getStudent);
router.post('/', createStudentRules, validate, controller.createStudent);
router.put('/:id', idParam, updateStudentRules, validate, controller.updateStudent);
router.patch('/:id/status', idParam, userStatusRules, validate, controller.updateStudentStatus);

export default router;