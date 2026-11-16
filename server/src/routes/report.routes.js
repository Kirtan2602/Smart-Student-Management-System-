import { Router } from 'express';
import * as controller from '../controllers/report.controller.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { idParam } from '../validators/common.validator.js';
import {
  exportRules,
  subjectReportRules,
  subjectExportRules,
  semesterExportRules,
  studentsExportRules,
} from '../validators/report.validator.js';

const router = Router();

router.use(authenticate);

const admin = authorize('ADMIN');
const staff = authorize('ADMIN', 'TEACHER');
const student = authorize('STUDENT');

// Admin
router.get('/overview', admin, controller.overview);
router.get('/students/export', admin, studentsExportRules, validate, controller.exportStudents);
router.get('/semester/export', admin, semesterExportRules, validate, controller.exportSemester);
router.get('/student/:id', admin, idParam, validate, controller.studentReport);
router.get('/student/:id/export', admin, idParam, exportRules, validate, controller.exportStudent);

// Admin + Teacher (teacher no subject-level check service ma chhe)
router.get('/subject/:id', staff, idParam, subjectReportRules, validate, controller.subjectReport);
router.get('/subject/:id/export', staff, idParam, subjectExportRules, validate, controller.exportSubject);

// Student: fakt potano report (id token mathi)
router.get('/my', student, controller.myReport);
router.get('/my/export', student, exportRules, validate, controller.exportMy);

export default router;