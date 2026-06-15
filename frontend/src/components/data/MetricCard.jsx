import React from 'react';

const MetricCard = ({ label, value, icon: Icon, tone = 'blue' }) => {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    slate: 'bg-slate-100 text-slate-700'
  }[tone] || 'bg-slate-100 text-slate-700';

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}>
            <Icon size={22} />
          </div>
        )}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
