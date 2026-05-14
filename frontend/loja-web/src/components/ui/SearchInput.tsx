import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder, className }) => {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full h-12 bg-[#151515] border border-[#2a2a2a] rounded-full px-12 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:outline-none focus:ring-0 focus:border-[#a100ff] transition-colors duration-200',
          className
        )}
      />
    </div>
  );
};
