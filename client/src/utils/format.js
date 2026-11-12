export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('en-IN') : '-';

// "2008-01-05T00:00:00.000Z" -> "05/01/2008" (timezone na problem vagar)
export const formatDate = (value) => {
  if (!value) return '-';
  const [y, m, d] = String(value).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

// Date input (type="date") mate: "2008-01-05"
export const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

export const getDisplayName = (user) => {
  const profile = user?.student || user?.teacher;
  if (profile) return `${profile.firstName} ${profile.lastName}`;
  return user?.email || '';
};

// Aaj ni tarikh "YYYY-MM-DD" (date input mate, local timezone ma)
export const todayInput = () => new Date().toLocaleDateString('en-CA');