import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './components/app';
import { Button } from './components/button';
import { Link } from './components/link';
import { NotFound } from './components/not-found';
import { Pixel } from './components/pixel';
import { Radio } from './components/radio';
import { RadioGroup } from './components/radio-group';
import { Text } from './components/text';
import { TextArea } from './components/text-area';
import { Title } from './components/title';
import { ReactNode } from 'react';

const Props = ({ props }: { props: Record<string, unknown> }) =>
  Object.keys(props).length === 0 ? (
    <></>
  ) : (
    <div className="hidden relative w-0 h-0">
      <div className="absolute top-100 left-100 bg-[#0e0c15] p-2 border min-w-[250px] z-10">
        {Object.entries(props).map(([key, value]) => (
          <div key={key} className="flex justify-space-between">
            <span className="text-gray-400 mr-2">{key}</span>
            {' = '}
            <span className="text-gray-200 ml-2">{JSON.stringify(value, null, 0)}</span>
          </div>
        ))}
      </div>
    </div>
  );

const Section = ({
  title,
  props,
  children,
}: {
  title: ReactNode;
  props: Record<string, unknown>;
  children: React.ReactNode;
}) => (
  <div className="w-full my-2 p-4 border">
    <div className="flex justify-space-between">
      <h2 className="text-2xl font-bold inline-block mr-2">{title}</h2>
      <Props props={props} />
    </div>
    <div className="my-2">{children}</div>
  </div>
);

const components = [
  {
    name: 'App',
    component: () => <App title="Demo" description="A demo app" domain="demo.example.com" />,
  },
  { name: 'Button', component: () => <Button>Demo Button</Button> },
  { name: 'Link', component: () => <Link href="/">Demo Link</Link> },
  { name: 'NotFound', component: () => <NotFound /> },
  { name: 'Pixel', component: () => <Pixel domain="demo.example.com" /> },
  {
    name: 'Radio',
    component: () => (
      <>
        <Radio name="demo-radio" label="Yes" value="yes" />
        <Radio name="demo-radio" label="No" value="no" defaultChecked />
      </>
    ),
  },
  {
    name: 'Radio Group',
    component: () => (
      <RadioGroup
        name="demo-radio"
        options={[
          {
            label: 'Yes',
            value: 'yes',
          },
          {
            label: 'No',
            value: 'no',
          },
        ]}
      />
    ),
  },
  { name: 'Text', component: () => <Text>Demo Text</Text> },
  { name: 'TextArea', component: () => <TextArea id="demo-text-area" name="demo-text-area" /> },
  { name: 'Title', component: () => <Title>Demo Title</Title> },
];

const ComponentShowcase = () => (
  <App title="Components" description="All of my standard components" domain="components.fish.lgbt" tailwind htmx pixel>
    <style>{`
      h2.text-2xl.font-bold.inline-block.mr-2:hover +div {
        display: block;
      }
    `}</style>
    {components.map(({ name, component }) => {
      const renderedComponent = component();
      const { children: _, ...props } = renderedComponent.props;
      return (
        <Section key={name} title={`<${name} />`} props={props}>
          {renderedComponent}
        </Section>
      );
    })}
  </App>
);

const server = Bun.serve({
  port: process.env.PORT ?? 3000,
  fetch() {
    return new Response('<!doctype html>' + renderToStaticMarkup(<ComponentShowcase />), {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  },
});

console.info(`Server listening at http://localhost:${server.port}`);
