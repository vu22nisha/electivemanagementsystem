import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: string;
}) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allowedRole) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
