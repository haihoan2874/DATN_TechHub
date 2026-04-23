import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SLButton = React.forwardRef(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    
    const variants = {
      primary: 'bg-brand-primary text-white shadow-lg shadow-blue-500/20 hover-brand-hover active-[0.98]',
      secondary: 'bg-blue-50 text-brand-primary hover-blue-100 active-[0.98]',
      outline: 'bg-transparent border-2 border-slate-200 text-slate-700 hover-brand-primary hover-brand-primary active-[0.98]',
      ghost: 'bg-transparent text-slate-600 hover-slate-50',
      danger: 'bg-status-error text-white hover-90 active-[0.98]'
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
      xl: 'px-10 py-5 text-lg font-bold uppercase tracking-widest'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'relative inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl disabled-50 disabled-not-allowed overflow-hidden',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        <span className={cn('flex items-center gap-2', isLoading && 'invisible')}>
          {leftIcon}
          {children}
          {rightIcon}
        </span>
      </button>
    );
  }
);

SLButton.displayName = 'SLButton';

export default SLButton;
