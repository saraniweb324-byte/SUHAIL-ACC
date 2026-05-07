import React from 'react';

export default function Table({ columns, data, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-lg border border-border bg-white ${className}`}>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-[#f8fafc] sticky top-0">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-border">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 whitespace-nowrap text-sm text-text ${col.tdClassName || ''}`}>
                    {col.render ? col.render(row, rowIndex) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Activity List View */}
      <div className="md:hidden space-y-3 p-4 bg-bg">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="p-4 bg-white rounded-2xl shadow-sm flex items-center justify-between active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
              {/* Icon based on type or just a generic one */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${row.type === 'income' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                {row.type === 'income' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 17 10-10"/><path d="M7 7h10v10"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 7 10 10"/><path d="M17 7v10H7"/></svg>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm uppercase tracking-tight">
                  {row.category || row.item || 'Transaction'}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {row.date ? new Date(row.date).toLocaleDateString('en-GB') : '-'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className={`font-bold text-base ${row.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {row.type === 'income' ? '+' : '-'}{typeof row.amount === 'number' ? `₹${row.amount.toLocaleString('en-IN')}` : row.amount}
              </span>
              
              {/* Small Action buttons if they exist */}
              {columns.find(c => c.key === 'actions') && (
                <div className="flex gap-2">
                  {columns.find(c => c.key === 'actions').render(row, rowIndex)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
