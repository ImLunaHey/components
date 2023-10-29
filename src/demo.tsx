import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './components/app';
import { Text } from './components/text';

const server = Bun.serve({
  port: process.env.PORT ?? 3000,
  fetch() {
    return new Response(
      '<!doctype html>' +
        renderToStaticMarkup(
          <App title="Components" description="All of my standard components" domain="components.fish.lgbt">
            <Text>Hello World!</Text>
          </App>,
        ),
      {
        headers: {
          'Content-Type': 'text/html',
        },
      },
    );
  },
});

console.info(`Server listening at http://localhost:${server.port}`);
