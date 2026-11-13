import api from './api';
import { cleanParams } from '../utils/params';

// ---------- Grade rules ----------
export const fetchGradeRules = async () => (await api.get('/grade-rules')).data.data;
export const createGradeRule = async (payload) => (await api.post('/grade-rules', payload)).data.data;
export const updateGradeRule = async (id, payload) =>
  (await api.put(`/grade-rules/${id}`, payload)).data.data;
export const deleteGradeRule = async (id) => (await api.delete(`/grade-rules/${id}`)).data;

// ---------- Results ----------
export const fetchMyResults = async (params) =>
  (await api.get('/results/my', { params: cleanParams(params) })).data.data;
export const fetchSubjectResults = async (params) =>
  (await api.get('/results/subject', { params: cleanParams(params) })).data.data;
export const fetchSemesterResults = async (params) =>
  (await api.get('/results/semester', { params: cleanParams(params) })).data.data;