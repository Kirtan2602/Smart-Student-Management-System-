import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/notification.service.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, unreadOnly } = req.query;
  const result = await service.listNotifications(req.user.id, {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    unreadOnly: unreadOnly === 'true',
  });
  res.json({ success: true, data: result.items, meta: result.meta, unread: result.unread });
});

export const unreadCount = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { unread: await service.getUnreadCount(req.user.id) } });
});

export const read = asyncHandler(async (req, res) => {
  await service.markRead(req.user.id, req.params.id);
  res.json({ success: true, message: 'Marked as read' });
});

export const readAll = asyncHandler(async (req, res) => {
  await service.markAllRead(req.user.id);
  res.json({ success: true, message: 'All notifications marked as read' });
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteNotification(req.user.id, req.params.id);
  res.json({ success: true, message: 'Notification deleted' });
});