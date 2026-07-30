import React from 'react';

export const Badge = ({ children, variant = 'indigo', className = '' }) => {
  const variants = {
    indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    rose: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    slate: 'bg-slate-800 text-slate-200 border-slate-700'
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border tracking-wide uppercase ${
        variants[variant] || variants.indigo
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
