import api from './api';
import { cleanParams } from '../utils/params';

export const fetchNotifications = async (params) => {
  const res = await api.get('/notifications', { params: cleanParams(params) });
  return { items: res.data.data, meta: res.data.meta, unread: res.data.unread };
};
export const fetchUnreadCount = async () =>
  (await api.get('/notifications/unread-count')).data.data.unread;
export const markNotificationRead = async (id) => (await api.patch(`/notifications/${id}/read`)).data;
export const markAllNotificationsRead = async () => (await api.patch('/notifications/read-all')).data;
export const deleteNotification = async (id) => (await api.delete(`/notifications/${id}`)).data;