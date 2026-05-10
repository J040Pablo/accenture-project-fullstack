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
            "flex h-10 w-full rounded-lg border border-transparent bg-[#1e1e1e] px-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#a100ff] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
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
