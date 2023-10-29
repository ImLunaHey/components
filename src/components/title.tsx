import { PropsWithChildren, createElement } from 'react';
import { cn } from '../cn';

const sizeToInverse = {
  1: 6,
  2: 5,
  3: 4,
  4: 3,
  5: 2,
  6: 1,
};

export const Title: React.FC<
  PropsWithChildren<{
    size?: 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
  }>
> = ({ children, size = 1, className }) => {
  return createElement(
    `h${size}`,
    { className: cn(`text-${sizeToInverse[size] - 2 || 1}xl font-extrabold text-white mt-5 mb-2`, className) },
    children,
  );
};
