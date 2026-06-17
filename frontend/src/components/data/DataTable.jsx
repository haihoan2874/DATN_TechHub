import React from 'react';

const DataTable = ({ columns, children, footer, className = '' }) => {
  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && column.onSort && column.onSort(column.key)}
                  className={`px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 ${column.className || ''} ${column.sortable ? 'cursor-pointer hover:bg-slate-100 transition-colors select-none' : ''}`}
                >
                  <div className={`flex items-center gap-1.5 ${column.className?.includes('text-right') ? 'justify-end' : ''}`}>
                    {column.label}
                    {column.sortable && column.sortConfig?.key === column.key && (
                      <span className="text-blue-600">
                        {column.sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
      {footer ? (
        <div className="border-t border-slate-200 bg-white px-5 py-4">
          {footer}
        </div>
      ) : null}
    </div>
  );
};

export default DataTable;
