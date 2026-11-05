import { Router } from 'express';
import * as controller from '../controllers/user.controller.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { idParam } from '../validators/common.validator.js';
import {
  createUserRules,
  listUserRules,
  userStatusRules,
} from '../validators/user.validator.js';

const router = Router();

// Aa file na badha routes fakt ADMIN mate
router.use(authenticate, authorize('ADMIN'));

router.get('/', listUserRules, validate, controller.listUsers);
router.post('/', createUserRules, validate, controller.createUser);
router.patch('/:id/status', idParam, userStatusRules, validate, controller.updateUserStatus);

export default router;