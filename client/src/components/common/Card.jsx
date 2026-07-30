import React from 'react';

export const Card = ({ children, className = '', id }) => {
  return (
    <div
      id={id}
      className={`bg-[#FAF8F2] border border-[#CBC3B2] rounded-xl p-7 md:p-8 shadow-xs text-[#1F150C] ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`border-b border-[#CBC3B2] pb-4 mb-6 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-xl font-semibold text-[#1F150C] tracking-tight ${className}`}>
      {children}
    </h3>
  );
};

export default Card;
