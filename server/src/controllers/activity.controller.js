import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/activity.service.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, action, search, from, to } = req.query;
  const result = await service.listActivityLogs({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 15,
    action,
    search,
    from,
    to,
  });
  res.json({ success: true, data: result.items, meta: result.meta, actions: result.actions });
});