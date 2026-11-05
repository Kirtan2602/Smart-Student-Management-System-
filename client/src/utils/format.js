export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('en-IN') : '-';

export const getDisplayName = (user) => {
  const profile = user?.student || user?.teacher;
  if (profile) return `${profile.firstName} ${profile.lastName}`;
  return user?.email || '';
};