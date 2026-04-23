import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SlifeAdvisor from '../components/common/SlifeAdvisor';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white selection-blue-600 selection-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <SlifeAdvisor />
    </div>
  );
};

export default MainLayout;
