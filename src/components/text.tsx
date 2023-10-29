import { HtmlHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../cn';

export const Text: React.FC<PropsWithChildren<HtmlHTMLAttributes<HTMLParagraphElement> & { inline?: boolean }>> = ({
  children,
  inline = false,
  className = '',
  ...passthrough
}) => {
  if (inline)
    return (
      <span className={cn('text-gray-500 dark:text-gray-400 ', className)} {...passthrough}>
        {children}
      </span>
    );

  return (
    <p className={cn('text-gray-500 dark:text-gray-400 ', className)} {...passthrough}>
      {children}
    </p>
  );
};
