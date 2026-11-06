import asyncHandler from '../utils/asyncHandler.js';
import * as teacherService from '../services/teacher.service.js';
import { logActivity } from '../utils/activityLogger.js';

const log = (req, action, teacher, details) =>
  logActivity({
    userId: req.user.id,
    action,
    entity: 'Teacher',
    entityId: teacher.id,
    details,
    ipAddress: req.ip,
  });

export const listTeachers = asyncHandler(async (req, res) => {
  const { page, limit, search, departmentId, isActive } = req.query;

  const result = await teacherService.getAllTeachers({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    search,
    departmentId: departmentId ? Number(departmentId) : undefined,
    isActive: isActive === undefined ? undefined : isActive === 'true',
  });

  res.json({ success: true, data: result.items, meta: result.meta });
});

export const getTeacher = asyncHandler(async (req, res) => {
  const data = await teacherService.getTeacherById(req.params.id);
  res.json({ success: true, data });
});

export const createTeacher = asyncHandler(async (req, res) => {
  const data = await teacherService.createTeacher(req.body);
  await log(req, 'CREATE_TEACHER', data, `Added teacher ${data.employeeCode}`);
  res.status(201).json({ success: true, message: 'Teacher created successfully', data });
});

export const updateTeacher = asyncHandler(async (req, res) => {
  const data = await teacherService.updateTeacher(req.params.id, req.body);
  await log(req, 'UPDATE_TEACHER', data, `Updated teacher ${data.employeeCode}`);
  res.json({ success: true, message: 'Teacher updated successfully', data });
});

export const updateTeacherStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const data = await teacherService.setTeacherStatus(req.params.id, isActive);
  await log(
    req,
    isActive ? 'ACTIVATE_TEACHER' : 'DEACTIVATE_TEACHER',
    data,
    `${isActive ? 'Activated' : 'Deactivated'} teacher ${data.employeeCode}`
  );
  res.json({
    success: true,
    message: `Teacher ${isActive ? 'activated' : 'deactivated'} successfully`,
    data,
  });
});

export const assignSubjects = asyncHandler(async (req, res) => {
  const { subjectIds, academicYearId } = req.body;
  const data = await teacherService.assignSubjects(req.params.id, subjectIds, academicYearId);
  await log(req, 'ASSIGN_SUBJECTS', data, `Assigned ${subjectIds.length} subject(s) to ${data.employeeCode}`);
  res.json({ success: true, message: 'Subjects assigned successfully', data });
});