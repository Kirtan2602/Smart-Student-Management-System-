import asyncHandler from '../utils/asyncHandler.js';
import * as studentService from '../services/student.service.js';
import { logActivity } from '../utils/activityLogger.js';

const log = (req, action, student, details) =>
  logActivity({
    userId: req.user.id,
    action,
    entity: 'Student',
    entityId: student.id,
    details,
    ipAddress: req.ip,
  });

export const listStudents = asyncHandler(async (req, res) => {
  const { page, limit, search, departmentId, semesterId, academicYearId, isActive } = req.query;

  const result = await studentService.getAllStudents({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    search,
    departmentId: departmentId ? Number(departmentId) : undefined,
    semesterId: semesterId ? Number(semesterId) : undefined,
    academicYearId: academicYearId ? Number(academicYearId) : undefined,
    isActive: isActive === undefined ? undefined : isActive === 'true',
  });

  res.json({ success: true, data: result.items, meta: result.meta });
});

export const getStudent = asyncHandler(async (req, res) => {
  const data = await studentService.getStudentById(req.params.id);
  res.json({ success: true, data });
});

export const createStudent = asyncHandler(async (req, res) => {
  const data = await studentService.createStudent(req.body);
  await log(req, 'CREATE_STUDENT', data, `Added student ${data.enrollmentNo}`);
  res.status(201).json({ success: true, message: 'Student created successfully', data });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const data = await studentService.updateStudent(req.params.id, req.body);
  await log(req, 'UPDATE_STUDENT', data, `Updated student ${data.enrollmentNo}`);
  res.json({ success: true, message: 'Student updated successfully', data });
});

export const updateStudentStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const data = await studentService.setStudentStatus(req.params.id, isActive);
  await log(
    req,
    isActive ? 'ACTIVATE_STUDENT' : 'DEACTIVATE_STUDENT',
    data,
    `${isActive ? 'Activated' : 'Deactivated'} student ${data.enrollmentNo}`
  );
  res.json({
    success: true,
    message: `Student ${isActive ? 'activated' : 'deactivated'} successfully`,
    data,
  });
});