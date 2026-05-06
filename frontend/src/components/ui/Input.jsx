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
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
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
            w-full bg-slate-50 border-2 border-transparent 
            focus:bg-white focus:border-primary rounded-2xl 
            py-3 px-4 text-sm font-bold text-slate-900 
            placeholder:text-slate-300 focus:outline-none 
            transition-all shadow-inner
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-red-500 bg-red-50/30' : ''}
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
        <span className="text-[10px] font-bold text-red-500 ml-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
