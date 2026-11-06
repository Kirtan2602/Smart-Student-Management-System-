import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from "./Loader";
import { ROLE_HOME } from '../utils/roles';

// "/" par aavo to login ke dashboard par moklo
export default function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullPage />;
  return <Navigate to={user ? ROLE_HOME[user.role] : '/login'} replace />;
}