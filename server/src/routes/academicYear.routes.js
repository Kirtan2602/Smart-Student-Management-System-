import { Router } from 'express';
import * as controller from '../controllers/academicYear.controller.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { idParam } from '../validators/common.validator.js';
import {
  createAcademicYearRules,
  updateAcademicYearRules,
} from '../validators/academicYear.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', controller.listAcademicYears);

router.post('/', authorize('ADMIN'), createAcademicYearRules, validate, controller.createAcademicYear);
router.put('/:id', authorize('ADMIN'), idParam, updateAcademicYearRules, validate, controller.updateAcademicYear);
router.delete('/:id', authorize('ADMIN'), idParam, validate, controller.deleteAcademicYear);

export default router;