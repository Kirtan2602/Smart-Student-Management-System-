import { Router } from 'express';
import { listSemesters } from '../controllers/semester.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, listSemesters);

export default router;