import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'Không có dữ liệu', description, icon: Icon = Inbox }) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon size={22} />
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
    </div>
  );
};

export default EmptyState;
