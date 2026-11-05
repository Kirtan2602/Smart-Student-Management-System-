import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from './Loader';
import { ROLE_HOME } from '../utils/roles';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullPage text="Checking session..." />;
  if (!user) return <Navigate to="/login" replace />;

  // Khoti role no page: potana dashboard par moklo
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }

  return <Outlet />;
}