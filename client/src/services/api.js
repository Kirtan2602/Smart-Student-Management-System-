import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Access token fakt memory (aa variable) ma. localStorage ma nahi.
let accessToken = null;
let onAuthFailure = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const setAuthFailureHandler = (handler) => {
  onAuthFailure = handler;
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // refresh-token cookie moklva mate
});

// Darek request ma token jodo
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Ek j vaar refresh call thay (React StrictMode ma be vaar na thay etle)
let refreshPromise = null;

export const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh`, null, { withCredentials: true })
      .then((res) => {
        setAccessToken(res.data.data.accessToken);
        return res.data.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// 401 aave to ek vaar refresh karine request fari moklo
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthUrl = original?.url?.includes('/auth/');

    if (error.response?.status === 401 && original && !original._retry && !isAuthUrl) {
      original._retry = true;
      try {
        await refreshSession();
        return api(original);
      } catch {
        setAccessToken(null);
        if (onAuthFailure) onAuthFailure();
      }
    }
    return Promise.reject(error);
  }
);

export default api;