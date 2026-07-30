import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`border-b border-slate-800 pb-4 mb-4 space-y-1 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-xl font-bold text-slate-100 tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
};

export default Card;
