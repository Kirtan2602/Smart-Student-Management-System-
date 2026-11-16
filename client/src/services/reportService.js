import api from './api';
import { cleanParams } from '../utils/params';

export const fetchOverview = async () => (await api.get('/reports/overview')).data.data;

export const fetchSubjectReport = async (subjectId, params) =>
  (await api.get(`/reports/subject/${subjectId}`, { params: cleanParams(params) })).data.data;

export const fetchStudentReport = async (studentId) =>
  (await api.get(`/reports/student/${studentId}`)).data.data;

export const fetchMyReport = async () => (await api.get('/reports/my')).data.data;

// Access token memory ma hoy chhe, etle simple <a href> link kam na kare.
// Axios thi file (blob) lavi ne browser ma download karaviye chhe.
export const downloadFile = async (url, params, filename) => {
  let res;
  try {
    res = await api.get(url, { params: cleanParams(params), responseType: 'blob' });
  } catch (err) {
    // Error blob ma aave chhe, tene JSON ma vanchi ne message batavo
    if (err.response?.data instanceof Blob) {
      try {
        err.response.data = JSON.parse(await err.response.data.text());
      } catch {
        // parse na thay to generic message
      }
    }
    throw err;
  }

  const href = URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
};