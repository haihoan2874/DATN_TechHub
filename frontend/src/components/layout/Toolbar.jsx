import React from 'react';

const Toolbar = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center ${className}`}>
      {children}
    </div>
  );
};

export default Toolbar;
