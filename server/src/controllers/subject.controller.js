import asyncHandler from '../utils/asyncHandler.js';
import * as subjectService from '../services/subject.service.js';

export const listSubjects = asyncHandler(async (req, res) => {
  const { page, limit, search, departmentId, semesterId } = req.query;

  const result = await subjectService.getAllSubjects({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    search,
    departmentId: departmentId ? Number(departmentId) : undefined,
    semesterId: semesterId ? Number(semesterId) : undefined,
  });

  res.json({ success: true, data: result.items, meta: result.meta });
});

export const getSubject = asyncHandler(async (req, res) => {
  const data = await subjectService.getSubjectById(req.params.id);
  res.json({ success: true, data });
});

export const createSubject = asyncHandler(async (req, res) => {
  const data = await subjectService.createSubject(req.body);
  res.status(201).json({
    success: true,
    message: 'Subject created successfully',
    data,
  });
});

export const updateSubject = asyncHandler(async (req, res) => {
  const data = await subjectService.updateSubject(req.params.id, req.body);
  res.json({
    success: true,
    message: 'Subject updated successfully',
    data,
  });
});

export const deleteSubject = asyncHandler(async (req, res) => {
  await subjectService.deleteSubject(req.params.id);
  res.json({ success: true, message: 'Subject deleted successfully' });
});