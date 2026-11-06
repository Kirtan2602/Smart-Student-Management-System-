import { Router } from 'express';
import * as controller from '../controllers/semester.controller.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { idParam } from '../validators/common.validator.js';
import { createSemesterRules, updateSemesterRules } from '../validators/semester.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', controller.listSemesters);

router.post('/', authorize('ADMIN'), createSemesterRules, validate, controller.createSemester);
router.put('/:id', authorize('ADMIN'), idParam, updateSemesterRules, validate, controller.updateSemester);
router.delete('/:id', authorize('ADMIN'), idParam, validate, controller.deleteSemester);

export default router;