import React from 'react';

export const Badge = ({ children, variant = 'indigo', className = '' }) => {
  const variants = {
    indigo: 'bg-[#1F150C]/10 text-[#1F150C] border-[#1F150C]/20',
    blue: 'bg-[#1F150C]/10 text-[#1F150C] border-[#1F150C]/20',
    emerald: 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/30',
    success: 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/30',
    amber: 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30',
    warning: 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30',
    rose: 'bg-[#B3261E]/10 text-[#B3261E] border-[#B3261E]/30',
    danger: 'bg-[#B3261E]/10 text-[#B3261E] border-[#B3261E]/30',
    slate: 'bg-[#5E5648]/10 text-[#5E5648] border-[#5E5648]/30',
    gray: 'bg-[#5E5648]/10 text-[#5E5648] border-[#5E5648]/30'
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-xs sm:text-sm font-semibold border ${
        variants[variant] || variants.indigo
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
