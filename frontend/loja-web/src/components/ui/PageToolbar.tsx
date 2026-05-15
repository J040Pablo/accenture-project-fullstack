import React from 'react';
import { cn } from '../../utils';
import { SearchInput } from './SearchInput';

interface PageToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  rightContent?: React.ReactNode;
  searchAction?: React.ReactNode;
  className?: string;
  inputClassName?: string;
}

// input styling is handled by SearchInput; keep PageToolbar minimal

export const PageToolbar: React.FC<PageToolbarProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  rightContent,
  searchAction,
  className,
  inputClassName,
}) => {
  return (
    <section className={cn('page-toolbar', className)}>
      <div className="flex-1 min-w-0">
        <SearchInput value={searchTerm} onChange={onSearchChange} placeholder={searchPlaceholder} className={inputClassName} />
        {searchAction}
      </div>

      {rightContent && <div className="flex flex-wrap items-center gap-2 lg:justify-end">{rightContent}</div>}
    </section>
  );
};
