import api from './api';
import { cleanParams } from '../utils/params';

export const fetchStudents = async (params) => {
  const res = await api.get('/students', { params: cleanParams(params) });
  return { items: res.data.data, meta: res.data.meta };
};
export const fetchStudent = async (id) => (await api.get(`/students/${id}`)).data.data;
export const createStudent = async (payload) =>
  (await api.post('/students', payload)).data.data;
export const updateStudent = async (id, payload) =>
  (await api.put(`/students/${id}`, payload)).data.data;
export const setStudentStatus = async (id, isActive) =>
  (await api.patch(`/students/${id}/status`, { isActive })).data.data;