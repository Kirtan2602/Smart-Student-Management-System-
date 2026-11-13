import api from './api';
import { cleanParams } from '../utils/params';

export const fetchExams = async (params) => {
  const res = await api.get('/exams', { params: cleanParams(params) });
  return { items: res.data.data, meta: res.data.meta };
};
export const createExam = async (payload) => (await api.post('/exams', payload)).data.data;
export const updateExam = async (id, payload) => (await api.put(`/exams/${id}`, payload)).data.data;
export const deleteExam = async (id) => (await api.delete(`/exams/${id}`)).data;
export const setExamPublished = async (id, isPublished) =>
  (await api.patch(`/exams/${id}/publish`, { isPublished })).data.data;

export const fetchMarksSheet = async (id) => (await api.get(`/exams/${id}/marks`)).data.data;
export const saveMarks = async (id, marks) => (await api.put(`/exams/${id}/marks`, { marks })).data;