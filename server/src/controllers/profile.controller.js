import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/profile.service.js';
import { logActivity } from '../utils/activityLogger.js';

export const get = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getMyProfile(req.user.id) });
});

export const update = asyncHandler(async (req, res) => {
  const data = await service.updateMyProfile(req.user, req.body);

  await logActivity({
    userId: req.user.id,
    action: 'UPDATE_PROFILE',
    entity: 'User',
    entityId: req.user.id,
    details: 'Updated own profile',
    ipAddress: req.ip,
  });

  res.json({ success: true, message: 'Profile updated successfully', data });
});