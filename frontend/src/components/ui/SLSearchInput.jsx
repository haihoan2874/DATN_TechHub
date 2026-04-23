import React from 'react';
import { Search, X } from 'lucide-react';
import SLInput from './SLInput';

const SLSearchInput = ({ onClear, isLoading, value, ...props }) => {
  return (
    <div className="relative group w-full">
      <SLInput
        value={value}
        leftIcon={
          isLoading ? (
            <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <SearchIcon size={18} className="group-focus-within-110 transition-transform" />
          )
        }
        rightIcon={
          value && onClear && (
            <button 
              onClick={onClear}
              className="p-1 hover-slate-100 rounded-lg text-slate-400 hover-status-error transition-all active-90"
            >
              <X size={14} />
            </button>
          )
        }
        className="pr-10"
        {...props}
      />
      
      {/* Visual Decoration for "Elite Search" */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand-primary group-focus-within-full transition-all duration-500 rounded-full opacity-50" />
    </div>
  );
};

export default SLSearchInput;
