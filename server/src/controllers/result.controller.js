import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/result.service.js';

const toNum = (v) => (v ? Number(v) : undefined);

export const my = asyncHandler(async (req, res) => {
  const data = await service.getMyResults(req.user, {
    academicYearId: toNum(req.query.academicYearId),
  });
  res.json({ success: true, data });
});

export const subject = asyncHandler(async (req, res) => {
  const data = await service.getSubjectResults(req.user, {
    subjectId: Number(req.query.subjectId),
    academicYearId: toNum(req.query.academicYearId),
  });
  res.json({ success: true, data });
});

export const semester = asyncHandler(async (req, res) => {
  const data = await service.getSemesterResults(req.user, {
    semesterId: Number(req.query.semesterId),
    departmentId: Number(req.query.departmentId),
    academicYearId: toNum(req.query.academicYearId),
  });
  res.json({ success: true, data });
});