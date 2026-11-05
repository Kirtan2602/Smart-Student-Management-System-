// Axios error mathi user ne dekhadva layak message kadhe
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) {
    return 'Cannot connect to the server. Please check that the backend is running.';
  }
  return 'Something went wrong. Please try again.';
};