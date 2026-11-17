import { Router } from 'express';
import * as controller from '../controllers/profile.controller.js';
import validate from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { updateProfileRules } from '../validators/profile.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', controller.get);
router.put('/', updateProfileRules, validate, controller.update);

export default router;