import api from './api';
import { cleanParams } from '../utils/params';

export const fetchTeachers = async (params) => {
  const res = await api.get('/teachers', { params: cleanParams(params) });
  return { items: res.data.data, meta: res.data.meta };
};
export const fetchTeacher = async (id) => (await api.get(`/teachers/${id}`)).data.data;
export const createTeacher = async (payload) =>
  (await api.post('/teachers', payload)).data.data;
export const updateTeacher = async (id, payload) =>
  (await api.put(`/teachers/${id}`, payload)).data.data;
export const setTeacherStatus = async (id, isActive) =>
  (await api.patch(`/teachers/${id}/status`, { isActive })).data.data;
export const assignTeacherSubjects = async (id, payload) =>
  (await api.put(`/teachers/${id}/subjects`, payload)).data.data;