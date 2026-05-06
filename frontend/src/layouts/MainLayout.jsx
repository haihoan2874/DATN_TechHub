import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import AIChatbot from '../components/common/AIChatbot';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen relative">
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
