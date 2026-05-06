import React from 'react';
import { motion } from 'framer-motion';

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
  const baseStyles = "relative inline-flex items-center justify-center font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-primary shadow-lg shadow-slate-900/10",
    secondary: "bg-primary text-white hover:bg-slate-900 shadow-lg shadow-primary/20",
    outline: "bg-transparent border-2 border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px] rounded-xl",
    md: "px-8 py-3.5 text-[11px] rounded-2xl",
    lg: "px-10 py-4.5 text-[13px] rounded-[24px]",
    icon: "p-3 rounded-2xl"
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
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
      
      {/* Subtle Glow Effect on Hover */}
      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.button>
  );
};

export default Button;
