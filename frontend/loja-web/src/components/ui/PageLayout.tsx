import React from 'react';
import { cn } from '../../utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, className }) => {
  return <div className={cn('page-layout', className)}>{children}</div>;
};
