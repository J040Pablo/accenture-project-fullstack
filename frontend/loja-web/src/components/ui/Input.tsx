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
            "w-full bg-[#111111] border border-[#2a2a2a] h-11 rounded-xl px-4 text-sm text-white placeholder-slate-600 outline-none focus:outline-none focus:ring-0 focus:border-[#a100ff] focus:shadow-[0_0_15px_-3px_rgba(161,0,255,0.2)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 shadow-inner",
            error && "border-status-error focus:border-status-error focus:shadow-none",
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
