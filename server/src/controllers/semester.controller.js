import asyncHandler from '../utils/asyncHandler.js';
import * as semesterService from '../services/semester.service.js';

export const listSemesters = asyncHandler(async (req, res) => {
  const data = await semesterService.getAllSemesters();
  res.json({ success: true, data });
});