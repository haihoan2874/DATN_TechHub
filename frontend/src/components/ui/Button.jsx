import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false, 
  icon: Icon,
  iconPosition = 'left',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
    secondary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    outline: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
  };

  const sizes = {
    sm: "px-3 py-2 text-xs rounded-lg",
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-5 py-3 text-sm rounded-xl",
    icon: "p-2.5 rounded-xl"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading}
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
