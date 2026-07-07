import React, { useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ 
  label, 
  error, 
  icon: Icon, 
  className = '', 
  inputClassName = '',
  showPassword,
  togglePassword,
  ...props 
}) => {
  const generatedId = useId();
  const inputId = props.id || props.name || generatedId;

  return (
    <div className={`flex flex-col gap-1 sm:gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none">
            <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </div>
        )}
        
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`
            form-input
            ${Icon ? 'pl-9 sm:pl-10' : ''}
            ${error ? 'border-rose-500 bg-rose-50/30' : ''}
            ${inputClassName}
          `}
          {...props}
        />

        {togglePassword && (
          <button
            type="button"
            onClick={togglePassword}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      
      {error && (
        <span id={`${inputId}-error`} className="ml-1 text-xs font-semibold text-rose-600">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
