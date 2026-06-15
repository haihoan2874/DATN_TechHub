import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import AIChatbot from '../components/common/AIChatbot';

const MainLayout = () => {
  const { user } = useAuth();

  // Chặn hoàn toàn quyền truy cập của Admin vào trang User
  if (user?.role === 'ROLE_ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-transparent">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
};

export default MainLayout;
