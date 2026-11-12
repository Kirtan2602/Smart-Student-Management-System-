import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/attendance.service.js';
import { logActivity } from '../utils/activityLogger.js';

const toNum = (v) => (v ? Number(v) : undefined);

export const subjects = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getAttendanceSubjects(req.user) });
});

export const sheet = asyncHandler(async (req, res) => {
  const { subjectId, date, lectureNo } = req.query;
  const data = await service.getSheet(req.user, {
    subjectId: Number(subjectId),
    date,
    lectureNo: lectureNo ? Number(lectureNo) : 1,
  });
  res.json({ success: true, data });
});

export const save = asyncHandler(async (req, res) => {
  const result = await service.saveAttendance(req.user, req.body);

  await logActivity({
    userId: req.user.id,
    action: result.created ? 'MARK_ATTENDANCE' : 'UPDATE_ATTENDANCE',
    entity: 'AttendanceSession',
    entityId: result.sessionId,
    details: `${result.subject.code} on ${req.body.date} (lecture ${req.body.lectureNo || 1}): ${result.present} present, ${result.absent} absent`,
    ipAddress: req.ip,
  });

  res.status(result.created ? 201 : 200).json({
    success: true,
    message: result.created ? 'Attendance saved successfully' : 'Attendance updated successfully',
    data: result,
  });
});

export const history = asyncHandler(async (req, res) => {
  const { page, limit, subjectId, from, to } = req.query;
  const result = await service.getHistory(req.user, {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    subjectId: toNum(subjectId),
    from,
    to,
  });
  res.json({ success: true, data: result.items, meta: result.meta });
});

export const sessionDetail = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getSessionDetail(req.user, req.params.id) });
});

export const report = asyncHandler(async (req, res) => {
  const { subjectId, from, to, threshold } = req.query;
  const data = await service.getSubjectReport(req.user, {
    subjectId: Number(subjectId),
    from,
    to,
    threshold: toNum(threshold),
  });
  res.json({ success: true, data });
});

export const studentSummary = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getStudentSummaryForStaff(req.user, req.params.id) });
});

export const myAttendance = asyncHandler(async (req, res) => {
  const { page, limit, subjectId, from, to } = req.query;
  const result = await service.getMyAttendance(req.user, {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    subjectId: toNum(subjectId),
    from,
    to,
  });
  res.json({
    success: true,
    data: { summary: result.summary, history: result.history },
    meta: result.meta,
  });
});