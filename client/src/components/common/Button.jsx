import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#1F150C]/30 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 h-[50px] text-base';

  const sizes = {
    sm: 'px-4 py-2.5 text-sm gap-2 h-11',
    md: 'px-6 py-3 text-base gap-2.5 h-[50px]',
    lg: 'px-7 py-3.5 text-base gap-3 h-14'
  };

  const variants = {
    primary: 'bg-[#1F150C] hover:bg-[#382819] text-[#FFFFFF] shadow-2xs font-semibold border border-[#1F150C]',
    secondary: 'bg-[#FAF8F2] hover:bg-[#D7D0BE] text-[#1F150C] border border-[#1F150C] shadow-2xs font-semibold',
    outline: 'bg-transparent hover:bg-[#D7D0BE] text-[#1F150C] border border-[#1F150C] font-semibold',
    ghost: 'text-[#1F150C] hover:bg-[#D7D0BE] font-semibold',
    danger: 'bg-[#B3261E] hover:bg-[#8E1E17] text-[#FFFFFF] font-semibold shadow-2xs',
    success: 'bg-[#2E7D32] hover:bg-[#236027] text-[#FFFFFF] font-semibold shadow-2xs'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      {children}
    </button>
  );
};

export default Button;
