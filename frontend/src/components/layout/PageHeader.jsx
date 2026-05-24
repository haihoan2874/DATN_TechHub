import React from 'react';

const PageHeader = ({ eyebrow, title, description, icon: Icon, action }) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            {Icon && <Icon size={16} />}
            <span>{eyebrow}</span>
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-3">{action}</div>}
    </div>
  );
};

export default PageHeader;
