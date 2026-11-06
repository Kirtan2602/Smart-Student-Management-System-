import asyncHandler from '../utils/asyncHandler.js';
import * as semesterService from '../services/semester.service.js';

export const listSemesters = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await semesterService.getAllSemesters() });
});

export const createSemester = asyncHandler(async (req, res) => {
  const data = await semesterService.createSemester(req.body);
  res.status(201).json({ success: true, message: 'Semester created successfully', data });
});

export const updateSemester = asyncHandler(async (req, res) => {
  const data = await semesterService.updateSemester(req.params.id, req.body);
  res.json({ success: true, message: 'Semester updated successfully', data });
});

export const deleteSemester = asyncHandler(async (req, res) => {
  await semesterService.deleteSemester(req.params.id);
  res.json({ success: true, message: 'Semester deleted successfully' });
});