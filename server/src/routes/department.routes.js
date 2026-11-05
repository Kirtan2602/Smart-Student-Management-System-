import { Router } from 'express';
import * as controller from '../controllers/department.controller.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { idParam } from '../validators/common.validator.js';
import {
  createDepartmentRules,
  updateDepartmentRules,
  listDepartmentRules,
} from '../validators/department.validator.js';

const router = Router();

// Badha logged-in users joi shake
router.use(authenticate);

router.get('/', listDepartmentRules, validate, controller.listDepartments);
router.get('/:id', idParam, validate, controller.getDepartment);

// Fakt ADMIN badlav kari shake
router.post('/', authorize('ADMIN'), createDepartmentRules, validate, controller.createDepartment);
router.put('/:id', authorize('ADMIN'), idParam, updateDepartmentRules, validate, controller.updateDepartment);
router.delete('/:id', authorize('ADMIN'), idParam, validate, controller.deleteDepartment);

export default router;