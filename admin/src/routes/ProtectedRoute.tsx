import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@app/hooks';

/** Gates the entire dashboard shell behind a valid session; unauthenticated users bounce to /login. */
const ProtectedRoute: React.FC = () => {
  const { accessToken, status } = useAppSelector((state) => state.auth);

  if (!accessToken || status === 'guest') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
