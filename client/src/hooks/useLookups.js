import useFetch from './useFetch';
import { fetchLookups } from '../services/masterDataService';

// Departments, semesters, academic years (dropdowns mate)
export default function useLookups() {
  const { data, loading, error, reload } = useFetch(fetchLookups);

  return {
    departments: data?.departments || [],
    semesters: data?.semesters || [],
    academicYears: data?.academicYears || [],
    loading,
    error,
    reload,
  };
}