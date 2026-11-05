import { Router } from 'express';
import prisma from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { authenticate, authorize } from '../middleware/auth.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import departmentRoutes from './department.routes.js';
import semesterRoutes from './semester.routes.js';
import subjectRoutes from './subject.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

// Public: koi pan check kari shake
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working correctly',
    timestamp: new Date().toISOString(),
  });
});

// Database counts: fakt ADMIN
router.get(
  '/db-health',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const [users, departments, semesters, subjects] = await Promise.all([
      prisma.user.count(),
      prisma.department.count(),
      prisma.semester.count(),
      prisma.subject.count(),
    ]);

    res.json({
      success: true,
      message: 'Database connected successfully',
      counts: { users, departments, semesters, subjects },
    });
  })
);

// Module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/semesters', semesterRoutes);
router.use('/subjects', subjectRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;