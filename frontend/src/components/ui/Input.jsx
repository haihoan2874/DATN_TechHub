import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ 
  label, 
  error, 
  icon: Icon, 
  className = '', 
  showPassword,
  togglePassword,
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && (
        <label className="ml-1 text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            <Icon size={18} />
          </div>
        )}
        
        <input
          className={`
            w-full rounded-xl border border-slate-300 bg-white
            px-4 py-2.5 text-sm font-medium text-slate-900
            placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10
            transition-colors
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-rose-500 bg-rose-50/30' : ''}
          `}
          {...props}
        />

        {togglePassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      
      {error && (
        <span className="ml-1 text-xs font-semibold text-rose-600">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
