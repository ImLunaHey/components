import { PropsWithChildren } from 'react';
import { cn } from 'src/cn';

type LinkProps = PropsWithChildren<{ href?: string; external?: boolean; underline?: boolean; className?: string }>;

export const Link: React.FC<LinkProps> = ({
  href,
  children,
  external = false,
  underline = true,
  className,
  ...passthrough
}) => {
  // Links to outside websites
  if (external)
    return (
      <a
        href={href}
        title="This link will take you to an external website."
        className={cn(
          `font-semibold text-gray-900 ${underline && 'underline'} dark:text-white decoration-pink-500 after:content-['_↗']`,
          className,
        )}
        target="_blank"
        {...passthrough}
      >
        {children}
      </a>
    );

  // Internal links
  return (
    <a
      href={href}
      hx-get={href}
      hx-push-url="true"
      hx-swap="innerHTML transition:true"
      hx-target="body"
      className={cn(
        `font-semibold text-gray-900 ${underline && 'underline'} dark:text-white decoration-indigo-500`,
        className,
      )}
      {...passthrough}
    >
      {children}
    </a>
  );
};
