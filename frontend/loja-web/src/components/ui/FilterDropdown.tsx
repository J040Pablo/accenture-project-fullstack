import React, { useState, useRef, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { cn } from '../../utils';

interface FilterDropdownProps {
  activeFiltersCount?: number;
  children: React.ReactNode;
  onClose?: () => void;
  onClearFilters?: () => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  activeFiltersCount = 0,
  children,
  onClose,
  onClearFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleClearFilters = () => {
    onClearFilters?.();
  };

  return (
    <div className="relative inline-block">
      {/* Filter Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
          'bg-[#111111] border border-[#2a2a2a] text-slate-300',
          'hover:text-[#a100ff] hover:border-[#a100ff]/50',
          'focus:outline-none focus:ring-2 focus:ring-[#a100ff]/30'
        )}
      >
        <Filter className="w-4 h-4" />
        <span>Filtros</span>
        {activeFiltersCount > 0 && (
          <>
            <span className="text-slate-500">·</span>
            <span className="font-bold text-[#a100ff]">{activeFiltersCount}</span>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute top-full right-0 mt-2 w-80 z-50',
            'bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl shadow-2xl',
            'animate-in fade-in slide-in-from-top-2 duration-200'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#a100ff]" />
              Filtros
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-md hover:bg-[#1a1a1a] flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {children}
          </div>

          {/* Footer with action buttons */}
          <div className="border-t border-[#1a1a1a] px-6 py-4 flex flex-col gap-2">
            {/* Clear Filters Button - Only visible if there are active filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2',
                  'bg-[#111111] border border-[#2a2a2a] text-slate-400',
                  'hover:text-slate-200 hover:border-[#3a3a3a]'
                )}
              >
                <X className="w-3 h-3" />
                Limpar filtros
              </button>
            )}

            {/* Apply Button */}
            <button
              onClick={handleClose}
              className="w-full px-3 py-2 rounded-lg bg-[#a100ff] hover:bg-[#a100ff]/80 text-white text-xs font-semibold transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for filter groups
interface FilterGroupProps {
  title: string;
  children: React.ReactNode;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({ title, children }) => {
  return (
    <div className="mb-4 last:mb-0">
      <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
        {title}
      </h4>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
};

// Helper component for filter option buttons (toggle between values)
interface FilterOptionProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const FilterOption: React.FC<FilterOptionProps> = ({
  label,
  isActive,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left',
        isActive
          ? 'bg-[#a100ff] text-white'
          : 'bg-[#111111] text-slate-400 hover:text-slate-200 border border-[#2a2a2a]'
      )}
    >
      {label}
    </button>
  );
};
