import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (user) {
    return <Navigate to={user.role === 'ROLE_ADMIN' ? '/admin' : '/'} replace />;
  }

  return children;
};

export default GuestRoute;
