import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SLInput = React.forwardRef(
  ({ className, label, error, leftIcon, rightIcon, containerClassName, type, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
        {label && (
          <label className="text-xs font-semibold text-slate-500 ml-1">
            {label}
          </label>
        )}
        
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within-brand-primary transition-colors">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-4 outline-none transition-all font-bold text-sm focus-white focus-brand-primary/50 focus-4 focus-brand-primary/5',
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              error && 'border-status-error focus-status-error focus-status-error/5',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[10px] text-status-error font-medium ml-1 mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);

SLInput.displayName = 'SLInput';

export default SLInput;
