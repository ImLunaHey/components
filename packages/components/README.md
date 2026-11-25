# @imlunahey/components

Custom React components with compiled StyleX styles and neutral light/dark themes.
Import components from explicit subpaths; there is no handwritten barrel.

```tsx
import "@imlunahey/components/styles.css";
import { Theme } from "@imlunahey/components/theme";
import { LanguageSelect } from "@imlunahey/components/language-select";
import { FileUpload } from "@imlunahey/components/file-upload";

<Theme mode="dark">
  <LanguageSelect value={language} onValueChange={setLanguage} />
  <FileUpload label="Images" accept="image/*" multiple onFilesChange={setFiles} />
</Theme>;
```

Exports: `button`, `input`, `textarea`, `panel`, `badge`, `select`, `combobox`,
`language-select`, `file-upload`, `data-table`, `line-chart`, `dialog`, `progress`,
`tabs`, `toggle`, `qr-code`, `theme`, `app-shell`, `record-tile`,
`description-list`, `filter-chip`, `pagination`, `empty-state`, `breadcrumbs`,
`code-block`, `media-image`, `search-field`, and `styles.css`.
TypeScript declarations are generated from the React sources.

Selects are controlled custom listboxes with keyboard navigation, optional search
and outside dismissal. Flags come from `country-flag-icons`. File uploads preview
images and release object URLs when attachments change or unmount. Progress bars
show details on hover and keyboard focus. Dialog uses the native modal focus and
Escape behavior with a dark backdrop and outside dismissal.

DataTable uses `@tanstack/react-table` column definitions and sorting; memoize
column definitions that render interactive cells. LineChart uses
`@tanstack/charts` and disposes its renderer on unmount. QRCode renders with `qrcode`.

The package requires React 19. Import the stylesheet once. It includes minimal
body-margin and box-sizing normalization; component rules are compiled StyleX
classes. Your application does not need a StyleX build plugin to consume it.

Build and pack:

```sh
pnpm --filter @imlunahey/components build
pnpm --filter @imlunahey/components pack --pack-destination ../../artifacts
# Install the output in a separate React project:
pnpm add /path/to/artifacts/imlunahey-components-0.1.0.tgz
```

The components package has not been published to a registry. The separate
`@imlunahey/oxlint-config` dependency is published on GitHub Packages.

Catalogue patterns include linked RecordTile cards, DescriptionList metadata,
removable FilterChip controls, Pagination, EmptyState, Breadcrumbs, and copyable
CodeBlock text. Pagination is controlled with `page`, `pageSize`, `total`, and
`onPageChange`. LanguageSelect accepts `includeAll` for an unfiltered option
(value `""`); individual languages retain their flags. See the gallery’s
`/catalogue` route and the Cardlattice app for composed examples.

For client-side navigation, Breadcrumbs and AppShell accept a `renderLink`
callback receiving anchor props (href, children, styling and accessibility props).
Render your router’s Link with those props, mapping href to its destination prop.
The default remains a native anchor for non-router consumers. RecordTile forwards
anchor props and its ref, so it can be wrapped with TanStack Router’s `createLink`.
See `src/demos/router-link.tsx` and `src/demos/record-link.tsx` for adapters.

MediaImage reserves an aspect ratio for images and displays an accessible fallback
when the image is missing or fails to load. It supports eager or lazy loading.

SearchField provides a compact search form with an accessible label and integrated
submit button. The `useSystemTheme` hook from `theme` follows the OS colour-scheme
preference and updates immediately when it changes. Cardlattice uses this hook
instead of a saved theme or a theme switcher.
