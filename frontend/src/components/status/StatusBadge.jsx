import React from 'react';

const toneClasses = {
  slate: 'border-slate-200 bg-slate-50 text-slate-600',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-rose-200 bg-rose-50 text-rose-700'
};

const StatusBadge = ({ children, tone = 'slate', icon: Icon }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses[tone] || toneClasses.slate}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};

export default StatusBadge;
