import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/academicYear.service.js';

export const listAcademicYears = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getAllAcademicYears() });
});

export const createAcademicYear = asyncHandler(async (req, res) => {
  const data = await service.createAcademicYear(req.body);
  res.status(201).json({ success: true, message: 'Academic year created successfully', data });
});

export const updateAcademicYear = asyncHandler(async (req, res) => {
  const data = await service.updateAcademicYear(req.params.id, req.body);
  res.json({ success: true, message: 'Academic year updated successfully', data });
});

export const deleteAcademicYear = asyncHandler(async (req, res) => {
  await service.deleteAcademicYear(req.params.id);
  res.json({ success: true, message: 'Academic year deleted successfully' });
});