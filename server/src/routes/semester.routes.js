import { Router } from 'express';
import { listSemesters } from '../controllers/semester.controller.js';

const router = Router();

router.get('/', listSemesters);

export default router;