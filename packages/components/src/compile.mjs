// Declarative component references used by static app templates. Native markup is
// emitted here; picker behavior and shared styles are loaded by the app shell.
const primitives = new Set(['button', 'input', 'textarea', 'select', 'dialog', 'table', 'progress', 'meter']);
export function compileComponents(source) {
  if (/<ui-input\b[^>]*\btype\s*=\s*(?:["']file["']|file\b)/i.test(source)) throw new Error('Use mountFileAttachment for file uploads; ui-input cannot expose the native file control.');
  return source.replace(/<(\/?)ui-([a-z]+)(?=[\s>])/gi, (match, close, name) => {
    if (!primitives.has(name)) throw new Error(`Unknown component: ui-${name}`);
    return `<${close}${name}`;
  });
}
