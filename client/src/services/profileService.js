import api from './api';

export const fetchProfile = async () => (await api.get('/profile')).data.data;
export const updateProfile = async (payload) => (await api.put('/profile', payload)).data.data;
export const changePassword = async (payload) =>
  (await api.post('/auth/change-password', payload)).data;

// Admin: kono pan user no password reset
export const resetUserPassword = async (userId, newPassword) =>
  (await api.patch(`/users/${userId}/password`, { newPassword })).data;