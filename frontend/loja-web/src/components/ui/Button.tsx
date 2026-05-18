import React from 'react';
import { cn } from '../../utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors border border-transparent outline-none focus:outline-none focus:ring-0 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover border border-[#a100ff] rounded-xl outline-none focus:outline-none focus:ring-0 active:scale-[0.98]',
    secondary: 'bg-[#1a1a1a] text-slate-100 hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-xl outline-none focus:outline-none focus:ring-0 active:scale-[0.98]',
    danger: 'bg-status-error/10 text-status-error border border-status-error/20 hover:bg-status-error hover:text-white rounded-xl outline-none focus:outline-none focus:ring-0 transition-colors',
    ghost: 'bg-transparent text-slate-400 hover:bg-white/[0.03] hover:text-white outline-none focus:outline-none focus:ring-0',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
