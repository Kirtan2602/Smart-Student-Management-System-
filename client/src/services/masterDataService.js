import api from './api';
import { cleanParams } from '../utils/params';

// ---------- Departments ----------
export const fetchDepartments = async (params) =>
  (await api.get('/departments', { params: cleanParams(params) })).data.data;
export const createDepartment = async (payload) =>
  (await api.post('/departments', payload)).data.data;
export const updateDepartment = async (id, payload) =>
  (await api.put(`/departments/${id}`, payload)).data.data;
export const deleteDepartment = async (id) => (await api.delete(`/departments/${id}`)).data;

// ---------- Semesters ----------
export const fetchSemesters = async () => (await api.get('/semesters')).data.data;
export const createSemester = async (payload) =>
  (await api.post('/semesters', payload)).data.data;
export const updateSemester = async (id, payload) =>
  (await api.put(`/semesters/${id}`, payload)).data.data;
export const deleteSemester = async (id) => (await api.delete(`/semesters/${id}`)).data;

// ---------- Academic years ----------
export const fetchAcademicYears = async () => (await api.get('/academic-years')).data.data;
export const createAcademicYear = async (payload) =>
  (await api.post('/academic-years', payload)).data.data;
export const updateAcademicYear = async (id, payload) =>
  (await api.put(`/academic-years/${id}`, payload)).data.data;
export const deleteAcademicYear = async (id) =>
  (await api.delete(`/academic-years/${id}`)).data;

// ---------- Subjects (paginated) ----------
export const fetchSubjects = async (params) => {
  const res = await api.get('/subjects', { params: cleanParams(params) });
  return { items: res.data.data, meta: res.data.meta };
};
export const createSubject = async (payload) =>
  (await api.post('/subjects', payload)).data.data;
export const updateSubject = async (id, payload) =>
  (await api.put(`/subjects/${id}`, payload)).data.data;
export const deleteSubject = async (id) => (await api.delete(`/subjects/${id}`)).data;

// ---------- Dropdowns mate ek sathe ----------
export const fetchLookups = async () => {
  const [departments, semesters, academicYears] = await Promise.all([
    fetchDepartments(),
    fetchSemesters(),
    fetchAcademicYears(),
  ]);
  return { departments, semesters, academicYears };
};