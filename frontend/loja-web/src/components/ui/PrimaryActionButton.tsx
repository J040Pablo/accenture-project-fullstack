import React from 'react';
import { Button } from './Button';
import { cn } from '../../utils';

type PrimaryActionButtonProps = React.ComponentProps<typeof Button>;

export const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({ className, ...props }) => {
  return (
    <Button
      className={cn(
        'w-full md:w-auto h-11 px-6 rounded-xl bg-[#a100ff] text-white font-bold hover:bg-[#b833ff] shadow-lg shadow-[#a100ff]/20 transition-all gap-2',
        className
      )}
      {...props}
    />
  );
};
