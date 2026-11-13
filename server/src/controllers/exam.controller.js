import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/exam.service.js';
import { logActivity } from '../utils/activityLogger.js';

const toNum = (v) => (v ? Number(v) : undefined);

const log = (req, action, exam, details) =>
  logActivity({
    userId: req.user.id,
    action,
    entity: 'Exam',
    entityId: exam.id,
    details,
    ipAddress: req.ip,
  });

export const list = asyncHandler(async (req, res) => {
  const { page, limit, subjectId, type, academicYearId, isPublished, search } = req.query;
  const result = await service.listExams(req.user, {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    subjectId: toNum(subjectId),
    type,
    academicYearId: toNum(academicYearId),
    isPublished: isPublished === undefined ? undefined : isPublished === 'true',
    search,
  });
  res.json({ success: true, data: result.items, meta: result.meta });
});

export const get = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getExamById(req.user, req.params.id) });
});

export const create = asyncHandler(async (req, res) => {
  const data = await service.createExam(req.user, req.body);
  await log(req, 'CREATE_EXAM', data, `Created exam "${data.name}" for ${data.subject.code}`);
  res.status(201).json({ success: true, message: 'Exam created successfully', data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await service.updateExam(req.user, req.params.id, req.body);
  await log(req, 'UPDATE_EXAM', data, `Updated exam "${data.name}"`);
  res.json({ success: true, message: 'Exam updated successfully', data });
});

export const remove = asyncHandler(async (req, res) => {
  const exam = await service.deleteExam(req.user, req.params.id);
  await log(req, 'DELETE_EXAM', exam, `Deleted exam "${exam.name}"`);
  res.json({ success: true, message: 'Exam deleted successfully' });
});

export const publish = asyncHandler(async (req, res) => {
  const { isPublished } = req.body;
  const data = await service.setPublished(req.user, req.params.id, isPublished);
  await log(
    req,
    isPublished ? 'PUBLISH_RESULTS' : 'UNPUBLISH_RESULTS',
    data,
    `${isPublished ? 'Published' : 'Unpublished'} results of "${data.name}"`
  );
  res.json({
    success: true,
    message: isPublished ? 'Results published successfully' : 'Results unpublished successfully',
    data,
  });
});

export const marksSheet = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getMarksSheet(req.user, req.params.id) });
});

export const saveMarks = asyncHandler(async (req, res) => {
  const result = await service.saveMarks(req.user, req.params.id, req.body.marks);
  await log(
    req,
    'ENTER_MARKS',
    result.exam,
    `"${result.exam.name}" (${result.exam.subject.code}): ${result.created} new, ${result.updated} updated`
  );
  res.json({
    success: true,
    message: `Marks saved successfully (${result.saved} student${result.saved === 1 ? '' : 's'})`,
    data: { saved: result.saved, created: result.created, updated: result.updated },
  });
});