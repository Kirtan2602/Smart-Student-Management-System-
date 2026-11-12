import { Router } from 'express';
import * as controller from '../controllers/attendance.controller.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { idParam } from '../validators/common.validator.js';
import {
  sheetRules,
  saveRules,
  historyRules,
  reportRules,
} from '../validators/attendance.validator.js';

const router = Router();

router.use(authenticate);

const staff = authorize('ADMIN', 'TEACHER');

// Student: fakt potani attendance
router.get('/my', authorize('STUDENT'), historyRules, validate, controller.myAttendance);

// Admin + Teacher (teacher no subject-level check service ma chhe)
router.get('/subjects', staff, controller.subjects);
router.get('/sheet', staff, sheetRules, validate, controller.sheet);
router.post('/', staff, saveRules, validate, controller.save);
router.get('/history', staff, historyRules, validate, controller.history);
router.get('/sessions/:id', staff, idParam, validate, controller.sessionDetail);
router.get('/report', staff, reportRules, validate, controller.report);
router.get('/students/:id/summary', staff, idParam, validate, controller.studentSummary);

export default router;