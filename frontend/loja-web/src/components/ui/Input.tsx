import React from 'react';
import { cn } from '../../utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1">
        {label && (
          <label className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "w-full bg-[#151515] border border-[#2a2a2a] h-11 rounded-xl px-4 text-sm text-white placeholder-slate-500 outline-none focus:outline-none focus:ring-0 focus:border-[#a100ff] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-status-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="text-xs text-status-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
