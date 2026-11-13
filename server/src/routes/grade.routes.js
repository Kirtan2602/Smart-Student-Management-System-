import { Router } from 'express';
import * as controller from '../controllers/grade.controller.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { idParam } from '../validators/common.validator.js';
import { createGradeRules, updateGradeRules } from '../validators/grade.validator.js';

const router = Router();

router.use(authenticate);

// Badha logged-in users jovi shake, fakt ADMIN badli shake
router.get('/', controller.list);
router.post('/', authorize('ADMIN'), createGradeRules, validate, controller.create);
router.put('/:id', authorize('ADMIN'), idParam, updateGradeRules, validate, controller.update);
router.delete('/:id', authorize('ADMIN'), idParam, validate, controller.remove);

export default router;