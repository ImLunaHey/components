import { LegacyRef, PropsWithChildren, forwardRef } from 'react';
import { Link } from './link';
import { Text } from './text';
import { Title } from './title';
import { Pixel } from './pixel';
import { getCommitHash } from 'get-commit-hash';

export const App = forwardRef<
  HTMLBodyElement,
  PropsWithChildren<{
    title: string;
    version: string;
    description: string;
    domain: string;
    tailwind?: boolean;
    htmx?: boolean;
    pixel?: boolean;
  }>
>(({ children, title, version, description, domain, tailwind, htmx, pixel }, ref) => (
  <html lang="en">
    <head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="view-transition" content="same-origin" />
      {tailwind && <script src="https://cdn.tailwindcss.com" />}
    </head>
    <body className="h-full w-full text-white bg-[#0e0c15]" ref={ref as LegacyRef<HTMLBodyElement>}>
      <header
        className="sm:w-4/6 w-5/6 container mx-auto mb-5"
        style={{
          viewTransitionName: 'main',
        }}
      >
        <Link href="/">
          <Title>{title}</Title>
        </Link>
      </header>

      <main className="sm:w-4/6 w-5/6 container mx-auto mb-5">{children}</main>

      <footer className="sm:w-4/6 w-5/6 container mx-auto mb-5">
        <div className="flex w-full justify-between align-bottom">
          <Text>
            &copy; {new Date().getFullYear()} {title}.
          </Text>
          <Text title={`v${version}+${getCommitHash(process.cwd())}`}>v{version}</Text>
        </div>
        {pixel && <Pixel domain={domain} />}
      </footer>
    </body>
    {htmx && <script src="https://fish.lgbt/assets/js/htmx.org@1.9.4.min.js"></script>}
  </html>
));
