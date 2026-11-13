import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/grade.service.js';
import { logActivity } from '../utils/activityLogger.js';

const log = (req, action, details, entityId = null) =>
  logActivity({ userId: req.user.id, action, entity: 'GradeRule', entityId, details, ipAddress: req.ip });

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getGradeRules() });
});

export const create = asyncHandler(async (req, res) => {
  const data = await service.createGradeRule(req.body);
  await log(req, 'CREATE_GRADE_RULE', `Added grade ${data.grade} (${data.minPercent}%+)`, data.id);
  res.status(201).json({ success: true, message: 'Grade rule created successfully', data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await service.updateGradeRule(req.params.id, req.body);
  await log(req, 'UPDATE_GRADE_RULE', `Updated grade ${data.grade}`, data.id);
  res.json({ success: true, message: 'Grade rule updated successfully', data });
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteGradeRule(req.params.id);
  await log(req, 'DELETE_GRADE_RULE', `Deleted grade rule #${req.params.id}`, req.params.id);
  res.json({ success: true, message: 'Grade rule deleted successfully' });
});