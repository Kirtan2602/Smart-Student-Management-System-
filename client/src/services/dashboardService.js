import api from './api';

export const fetchAdminDashboard = async () =>
  (await api.get('/dashboard/admin')).data.data;

export const fetchTeacherDashboard = async () =>
  (await api.get('/dashboard/teacher')).data.data;

export const fetchStudentDashboard = async () =>
  (await api.get('/dashboard/student')).data.data;