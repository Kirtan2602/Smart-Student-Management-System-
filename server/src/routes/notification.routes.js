import { Router } from 'express';
import * as controller from '../controllers/notification.controller.js';
import validate from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { idParam } from '../validators/common.validator.js';
import { listNotificationRules } from '../validators/notification.validator.js';

const router = Router();

// Badha logged-in users, pan darek ne fakt potani notifications
router.use(authenticate);

router.get('/', listNotificationRules, validate, controller.list);
router.get('/unread-count', controller.unreadCount);
router.patch('/read-all', controller.readAll); // '/:id/read' ni pehla hovu joie
router.patch('/:id/read', idParam, validate, controller.read);
router.delete('/:id', idParam, validate, controller.remove);

export default router;