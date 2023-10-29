import { PropsWithChildren } from 'react';
import { cn } from 'src/cn';

export const Button: React.FC<
  PropsWithChildren<{
    className?: string;
  }>
> = ({ children, className }) => (
  <button className={cn('bg-[#f8f8f2] text-[#1e1a2a] p-2 rounded-md', className)} type="submit">
    {children}
  </button>
);
