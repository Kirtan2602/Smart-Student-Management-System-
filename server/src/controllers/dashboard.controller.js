import asyncHandler from '../utils/asyncHandler.js';
import * as dashboardService from '../services/dashboard.service.js';

export const adminDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAdminDashboard();
  res.json({ success: true, data });
});

export const teacherDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTeacherDashboard(req.user.id);
  res.json({ success: true, data });
});

export const studentDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStudentDashboard(req.user.id);
  res.json({ success: true, data });
});