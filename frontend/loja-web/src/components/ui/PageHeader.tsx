import React from 'react';
import { cn } from '../../utils';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon, action, className }) => {
  return (
    <header className={cn('page-header', className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="page-header-icon">{icon}</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
        </div>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>
      {action && <div className="w-full md:w-auto">{action}</div>}
    </header>
  );
};
