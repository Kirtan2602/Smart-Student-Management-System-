import api from './api';
import { cleanParams } from '../utils/params';

export const fetchAttendanceSubjects = async () =>
  (await api.get('/attendance/subjects')).data.data;

export const fetchSheet = async (params) =>
  (await api.get('/attendance/sheet', { params })).data.data;

export const saveAttendance = async (payload) =>
  (await api.post('/attendance', payload)).data;

export const fetchHistory = async (params) => {
  const res = await api.get('/attendance/history', { params: cleanParams(params) });
  return { items: res.data.data, meta: res.data.meta };
};

export const fetchSession = async (id) =>
  (await api.get(`/attendance/sessions/${id}`)).data.data;

export const fetchReport = async (params) =>
  (await api.get('/attendance/report', { params: cleanParams(params) })).data.data;

export const fetchMyAttendance = async (params) => {
  const res = await api.get('/attendance/my', { params: cleanParams(params) });
  return { ...res.data.data, meta: res.data.meta };
};