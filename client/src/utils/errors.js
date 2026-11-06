// Axios error mathi user ne dekhadva layak message kadhe.
// Validation errors hoy to badhi field messages sathe batave.
export const getErrorMessage = (error) => {
  const data = error.response?.data;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.map((e) => e.message).join(' • ');
  }
  if (data?.message) return data.message;
  if (error.request) {
    return 'Cannot connect to the server. Please check that the backend is running.';
  }
  return 'Something went wrong. Please try again.';
};