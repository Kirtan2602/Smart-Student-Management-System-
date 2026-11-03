import asyncHandler from '../utils/asyncHandler.js';
import * as departmentService from '../services/department.service.js';

export const listDepartments = asyncHandler(async (req, res) => {
  const { search, isActive } = req.query;

  const data = await departmentService.getAllDepartments({
    search,
    isActive: isActive === undefined ? undefined : isActive === 'true',
  });

  res.json({ success: true, data });
});

export const getDepartment = asyncHandler(async (req, res) => {
  const data = await departmentService.getDepartmentById(req.params.id);
  res.json({ success: true, data });
});

export const createDepartment = asyncHandler(async (req, res) => {
  const data = await departmentService.createDepartment(req.body);
  res.status(201).json({
    success: true,
    message: 'Department created successfully',
    data,
  });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const data = await departmentService.updateDepartment(req.params.id, req.body);
  res.json({
    success: true,
    message: 'Department updated successfully',
    data,
  });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  await departmentService.deleteDepartment(req.params.id);
  res.json({ success: true, message: 'Department deleted successfully' });
});