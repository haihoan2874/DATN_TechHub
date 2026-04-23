import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check } from 'lucide-react';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SLCheckbox = React.forwardRef(
  ({ className, label, description, checked, ...props }, ref) => {
    return (
      <label className="flex items-start gap-3 cursor-pointer group select-none">
        <div className="relative flex items-center h-5 mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div className={cn(
            "w-5 h-5 border-2 border-slate-200 rounded-lg bg-white transition-all duration-300",
            "peer-checked-brand-primary peer-checked-brand-primary",
            "peer-focus-visible-4 peer-focus-visible-brand-primary/10",
            "group-hover-brand-primary group-hover-slate-50",
            className
          )}>
            <Check 
              size={12} 
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white transition-all duration-300 scale-0 opacity-0 stroke-[4]",
                checked && "scale-100 opacity-100"
              )} 
            />
          </div>
        </div>
        
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-bold text-slate-700 group-hover-brand-primary transition-colors italic uppercase tracking-tighter">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[10px] text-slate-400 font-medium italic">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

SLCheckbox.displayName = 'SLCheckbox';

export default SLCheckbox;
