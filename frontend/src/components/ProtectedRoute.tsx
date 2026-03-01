import { Navigate, useLocation } from 'react-router-dom';
}
  return <>{children}</>;

  }
    return <Navigate to="/login" state={{ from: location }} replace />;
  if (!token) {

  }
    );
      </div>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      <div className="flex items-center justify-center min-h-screen">
    return (
  if (isLoading) {

  const location = useLocation();
  const { token, isLoading } = useAuth();
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {

import { useAuth } from '../contexts/AuthContext';

