
import React from 'react';
import { cn } from '../../utils/cn';

interface CheckboxFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
  placeholder?: string;
  title?: string;
  readOnly?: boolean;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  value,
  onChange,
  placeholder,
  title,
  readOnly
}) => {
  return (
    <label className={cn(
      "flex items-center gap-3 cursor-pointer group select-none", 
      readOnly && "cursor-not-allowed opacity-70"
    )}>
      <div className="relative flex items-center justify-center">
        <input 
          type="checkbox"
          className="peer sr-only"
          checked={!!value}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={cn(
          "w-5 h-5 border-2 rounded-md transition-all duration-200 ease-in-out",
          "border-slate-300 bg-white",
          "peer-checked:bg-indigo-600 peer-checked:border-indigo-600",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2",
          "group-hover:border-indigo-400"
        )}></div>
        <svg 
          className={cn(
            "absolute w-3.5 h-3.5 text-white transition-all duration-200 ease-in-out transform",
            "opacity-0 scale-50",
            "peer-checked:opacity-100 peer-checked:scale-100"
          )} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
        {placeholder || title}
      </span>
    </label>
  );
};
