import api from './api';
import { cleanParams } from '../utils/params';

export const fetchActivityLogs = async (params) => {
  const res = await api.get('/activity-logs', { params: cleanParams(params) });
  return { items: res.data.data, meta: res.data.meta, actions: res.data.actions };
};