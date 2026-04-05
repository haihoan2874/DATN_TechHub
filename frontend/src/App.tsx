import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Storefront from './pages/Storefront';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductList from './pages/admin/products/ProductList';
import CategoryList from './pages/admin/categories/CategoryList';
import OrderList from './pages/admin/orders/OrderList';
import CustomerList from './pages/admin/customers/CustomerList';

// Placeholder components for routes not yet implemented
const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 italic">
    <h2 className="text-2xl font-black mb-4">{title}</h2>
    <p>This module is currently under development.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Storefront Routes */}
        <Route path="/" element={<Storefront />} />
        
        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/products" element={<AdminLayout><ProductList /></AdminLayout>} />
        <Route path="/admin/categories" element={<AdminLayout><CategoryList /></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><OrderList /></AdminLayout>} />
        <Route path="/admin/customers" element={<AdminLayout><CustomerList /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><Placeholder title="System Settings" /></AdminLayout>} />

        {/* Redirect any unknown paths to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
