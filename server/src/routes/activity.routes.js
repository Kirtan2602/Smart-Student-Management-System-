import { Router } from 'express';
import * as controller from '../controllers/activity.controller.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { listActivityRules } from '../validators/activity.validator.js';

const router = Router();

// Activity logs fakt ADMIN jue
router.use(authenticate, authorize('ADMIN'));

router.get('/', listActivityRules, validate, controller.list);

export default router;