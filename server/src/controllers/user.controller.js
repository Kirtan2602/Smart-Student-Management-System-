import asyncHandler from '../utils/asyncHandler.js';
import * as userService from '../services/user.service.js';
import { logActivity } from '../utils/activityLogger.js';

export const createUser = asyncHandler(async (req, res) => {
  const data = await userService.createUser(req.body);

  await logActivity({
    userId: req.user.id,
    action: 'CREATE_USER',
    entity: 'User',
    entityId: data.id,
    details: `Created ${data.role} account: ${data.email}`,
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data,
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, search } = req.query;

  const result = await userService.listUsers({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    role,
    search,
  });

  res.json({ success: true, data: result.items, meta: result.meta });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const data = await userService.setUserStatus(
    req.params.id,
    isActive,
    req.user.id
  );

  await logActivity({
    userId: req.user.id,
    action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
    entity: 'User',
    entityId: data.id,
    details: `${isActive ? 'Activated' : 'Deactivated'} account: ${data.email}`,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data,
  });
});