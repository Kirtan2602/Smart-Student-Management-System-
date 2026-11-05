import { Router } from 'express';
import * as controller from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/admin', authorize('ADMIN'), controller.adminDashboard);
router.get('/teacher', authorize('TEACHER'), controller.teacherDashboard);
router.get('/student', authorize('STUDENT'), controller.studentDashboard);

export default router;