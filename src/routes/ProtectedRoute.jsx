import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('id_token');

  if (!token) {
    return <Navigate to="/get-started" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
