import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border select-none min-h-[44px]';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/50 shadow-md shadow-indigo-600/25 focus:ring-indigo-500 focus:ring-offset-slate-950 active:scale-[0.99]',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700/80 focus:ring-slate-600 focus:ring-offset-slate-950 active:scale-[0.99]',
    outline: 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 border-slate-700 hover:border-slate-600 focus:ring-slate-600 focus:ring-offset-slate-950 active:scale-[0.99]',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border-transparent focus:ring-slate-700 active:scale-[0.99]',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500/50 shadow-md shadow-rose-600/20 focus:ring-rose-500 focus:ring-offset-slate-950 active:scale-[0.99]',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/50 shadow-md shadow-emerald-600/20 focus:ring-emerald-500 focus:ring-offset-slate-950 active:scale-[0.99]'
  };

  const sizes = {
    sm: 'text-sm px-4 py-2.5 gap-2 min-h-[44px]',
    md: 'text-base px-5 py-3 gap-2.5 min-h-[48px]',
    lg: 'text-lg px-6 py-3.5 gap-3 min-h-[52px]'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export default Button;
