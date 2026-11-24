# Component playground

Run `npm install`, then `npm run dev` to build and serve the interactive component gallery on `http://127.0.0.1:5220`.
The server reads the files in `design/` directly and reloads open pages when HTML, CSS or JavaScript files change.
After editing files in `src/`, run `npm run build` to refresh the browser bundles.

## Pages

- `/`: 84 component specimens, including custom selects, language comboboxes with SVG flags, image attachments, date and date-range pickers, command palette, dialogs and drawers
- `/#charts`: six TanStack Charts examples: line, stacked area, stacked bar, donut, scatter and heatmap
- `/#advanced-data`: TanStack Virtual event log, expandable TanStack Table groups and a file explorer
- `/#developer`: Pierre diffs, conflict resolution, inline review, Markdown, syntax highlighting, JSON inspection, demo terminal
- `/#app-patterns`: searchable project picker, filter builder, editable TanStack table, upload queue, workspace access and activity feed
- `/#cards-panels`: metric/resource cards, settings panels, tabbed details, collapsible diagnostics, selectable cards and async content states
- `/#qr-generator`: QR generator for URLs, plain text and Wi-Fi; SVG and PNG downloads
- `/#product-workflows`: all ten researched product patterns
- `/#html-elements`: HTML foundations and element coverage
- `/cardlattice`: catalogue status mockup
- `/fleet`: Fleet Monitor mockup
- `/fleet/fullscreen`: 3440 × 1440 wall display layout
- `/projects`: Orbit project tracker with board, saved views, sharing and discussions
- `/catalogue`: Shelf media library, image editor and CSV catalogue importer
- `/account`: Control billing, sharing, API keys and monitoring

The current dev server was started detached; its PID and log are in `.runtime/`.
Stop that process before running another server on the same port.

## Tailscale HTTPS

The gallery is served privately at `https://lake.tail3275e2.ts.net:5220/`.

Configure the proxy:

```sh
sudo tailscale serve --bg --https=5220 http://127.0.0.1:5220
```

Remove only this proxy:

```sh
sudo tailscale serve --https=5220 off
```

These are interactive design prototypes with sample data. The shared picker source lives in
`design/pickers.js`, `design/pickers.css` and `design/language-picker.js`; the standalone HTML previews
currently contain embedded copies of those sources.

The gallery table uses `@tanstack/table-core` for filtering, sorting, pagination, row selection
and column visibility. Its implementation and the additional interactions live in `src/components/gallery.js`;
esbuild produces `design/gallery-enhancements.js`. Extra specimens and styling live in
`src/components/templates/additional-components.html` and `design/gallery-enhancements.css`.

Charts and advanced data interactions live in `src/components/data-components.js`, with specimens in
`src/components/templates/data-components.html` and styles in `design/data-components.css`. Charts use the
framework-independent `@tanstack/charts` DOM host and inherit the shared light/dark tokens.
The virtual log uses `@tanstack/virtual-core` with 10,000 local sample events. Chart tooltips,
series visibility, time ranges, sorting, selection, log filtering and group expansion are interactive.
The specimen HTML files are also embedded in `src/components/templates/component-library.html`; keep those copies in sync.

Developer tools live in `src/components/developer-components.js`, `src/components/templates/developer-components.html`
and `design/developer-components.css`. The file explorer uses `@pierre/trees` and
`@pierre/diffs`; code is tokenized by `@pierre/highlights`. The Markdown composer uses
`@pierre/words` with DOMPurify sanitization. Merge resolution, review state and terminal commands affect sample data only.

`build.mjs` produces an ES module entry and lazy library chunks in `design/assets/js/`.
Everyday app workflows live in `src/components/app-components.js`, `src/components/templates/app-components.html` and
`design/app-components.css`. Project edits and permission changes update local sample data and
the activity feed. Uploads support previews, validation, cancellation and retry; transfer progress
is simulated, and files stay on the device. Both new tables use TanStack Table.

Cards, panels and QR utilities live in `src/components/surface-components.js`, `src/components/qr-code.js`,
`src/components/templates/surface-components.html` and `design/surface-components.css`. Shared `.ui-card`
header/body/footer styles use the existing theme tokens. QR encoding uses `qrcode`;
SVG and PNG exports share one matrix with an opaque white background and a quiet zone.
PNG downloads are 512, 1024 or 2048 pixels. Credentials and generated codes stay local.
Panel changes use sample data; sample CSV exports download actual files.

Product workflows live in `src/components/workflows/` with `src/components/workflow-components.js` as the gallery entry.
`build-demos.mjs` composes the same specimens into three app shells; `src/app-demo.js` handles
navigation and theme controls. `npm run build` regenerates these pages and both entry bundles.
The retired Workspace page and route have been removed.

Saved views persist to localStorage. Media edits and uploads stay in memory; PNG and CSV exports
are real downloads. Account invitations, permissions, API keys, billing and monitoring data are
local simulations. No emails, payments or authenticated requests are sent.

`npm test` checks model validation, DOM interactions, real canvas PNG output, app navigation,
HTML coverage and unique IDs. The date-range months use a fixed 294 px maximum width, equal
six-week grids and a stacked layout on narrow screens.

HTML coverage is documented in `docs/html-coverage.md`; the reference inventory is in
`docs/html-reference.json`. The CC0 flower video comes from MDN’s interactive examples; the
audio tone and SVG diagram are generated locally.

### Enforced component boundary

Run `npm run lint`. The same check runs **before every build**, including `npm run dev`
and `npm test`; violations fail with the source path and line number.

- `src/components/` owns native controls, reusable behavior, and specimen templates.
- `src/pages/` owns authored app-study HTML. App controllers live outside the component
  directory (`src/app-demo.js`); `build-demos.mjs` assembles shared specimens.
- App code cannot author native `button`, `input`, `textarea`, `select`, `dialog`,
  `table`, `progress`, or `meter`. Layout and semantic content HTML remain allowed.
- Static templates reference `ui-button`, `ui-input`, `ui-select`, etc.;
  `src/components/compile.mjs` emits native form semantics. Selects then mount the
  shared picker. File attachments must use `mountFileAttachment`, which hides the
  native chooser and supplies the visible button, filename, image preview and removal.
- JavaScript uses shared component functions. Do not move app/business code into
  `src/components/` merely to silence a violation.
- `design/*.html` and bundled JavaScript are generated; edit their sources, then
  build. CSS and media assets in `design/` remain authored. Tests may contain native
  HTML fixtures; they are not production app source.

The parser-based rule checks HTML (including inline scripts/templates), JavaScript,
JSX, HTML strings and native DOM construction. It is a static architectural check,
not a security boundary against deliberately obfuscated code. When introducing a
new source language or template engine, add parser coverage before using it.
