import React from 'react';
import { twMerge } from 'tailwind-merge';

const Button = ({ 
  type = 'button',
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false, 
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
    secondary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    outline: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
    light: "bg-white text-slate-950 hover:bg-slate-50 shadow-sm",
    glass: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md shadow-sm border border-white/20"
  };

  const sizes = {
    sm: "px-3 py-2 text-xs rounded-lg",
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-5 py-3 text-sm rounded-xl",
    icon: "p-2.5 rounded-xl"
  };

  return (
    <button
      type={type}
      className={twMerge(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <div className="flex items-center gap-2">
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 18} />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 18} />}
        </div>
      )}
    </button>
  );
};

export default Button;
