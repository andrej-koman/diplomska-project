import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useUser } from '@/contexts/UserContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, error } = useUser();

  if (isLoading) {
    return <p>Nalaganje...</p>;
  }

  if (error && !user) {
    return <Navigate to="/" replace />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
