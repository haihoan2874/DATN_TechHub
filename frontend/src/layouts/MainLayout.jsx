import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import AIChatbot from '../components/common/AIChatbot';

const MainLayout = () => {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50">
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
