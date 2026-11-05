import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';
import validate from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { loginRules } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', loginLimiter, loginRules, validate, controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.me);

export default router;