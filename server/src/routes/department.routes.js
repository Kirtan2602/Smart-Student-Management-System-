import { Router } from 'express';
import * as controller from '../controllers/department.controller.js';
import validate from '../middleware/validate.js';
import { idParam } from '../validators/common.validator.js';
import {
  createDepartmentRules,
  updateDepartmentRules,
  listDepartmentRules,
} from '../validators/department.validator.js';

const router = Router();

router.get('/', listDepartmentRules, validate, controller.listDepartments);
router.get('/:id', idParam, validate, controller.getDepartment);
router.post('/', createDepartmentRules, validate, controller.createDepartment);
router.put('/:id', idParam, updateDepartmentRules, validate, controller.updateDepartment);
router.delete('/:id', idParam, validate, controller.deleteDepartment);

export default router;