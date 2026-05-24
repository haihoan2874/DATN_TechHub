import React from 'react';

const PageShell = ({ children, className = '' }) => {
  return (
    <div className={`mx-auto w-full max-w-7xl space-y-6 ${className}`}>
      {children}
    </div>
  );
};

export default PageShell;
