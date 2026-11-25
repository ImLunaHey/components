# Luna components

React components styled with StyleX, in a pnpm/Turborepo workspace with six
independently launchable Vite apps. The shared Oxlint rules live in
[ImLunaHey/oxlint-config](https://github.com/ImLunaHey/oxlint-config).

## Install and run

The lint dependency is installed from GitHub Packages, not vendored. Configure
your existing GitHub CLI login and pnpm token helper using the
[registry setup instructions](https://github.com/ImLunaHey/oxlint-config/blob/luna/initial-project/README.md#install-from-github-packages).
The committed `.npmrc` contains only the scope mapping. CI uses `GITHUB_TOKEN`.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm dev
# Or launch a single app and its build dependencies:
pnpm exec turbo dev --filter=@imlunahey/demo-catalogue
```

| App                | Port | Package                       |
| ------------------ | ---- | ----------------------------- |
| Components gallery | 5230 | `@imlunahey/demo-gallery`     |
| Orbit projects     | 5231 | `@imlunahey/demo-projects`    |
| Shelf catalogue    | 5232 | `@imlunahey/demo-catalogue`   |
| Control account    | 5233 | `@imlunahey/demo-account`     |
| Cardlattice        | 5234 | `@imlunahey/demo-cardlattice` |
| Fleet              | 5235 | `@imlunahey/demo-fleet`       |

Each app has its own `index.html`, React entry point, Vite configuration and
production output. `dev` provides Vite hot reload; `start` previews its build.
Apps use TanStack Router pathname routes and share the React library. After
editing the library, rebuild it to update the consuming demos.

## Components

```tsx
import "@imlunahey/components/styles.css";
import { Theme } from "@imlunahey/components/theme";
import { Button } from "@imlunahey/components/button";

<Theme mode="dark">
  <Button variant="primary">Save changes</Button>
</Theme>;
```

See [the package API](packages/components/README.md) for all subpath exports.
StyleX compiles the package styles at build time; consumers import the emitted
CSS and do not need a StyleX compiler. New app layouts use StyleX too. Language
flags are React SVG components from the `country-flag-icons` npm dependency.

## Source and validation

- `packages/components/src/react`: public React implementations and StyleX tokens.
- `apps/*/src`: interactive app demos.
- `src/demos`: shared demo layout and routing.
- Other files in `packages/components/src`, `src/pages`, and `design/*.css`:
  preserved original DOM prototypes, not public React exports.

Native controls belong only in `packages/components/src`. Apps import custom
components, including file uploads, selects and TanStack tables. Oxlint and its
HTML companion enforce this boundary using `@imlunahey/oxlint-config@0.1.0`.
React Doctor's applicable default rules run through Oxlint, with no ESLint runner.

`pnpm check` checks TypeScript, Oxlint, HTML boundaries, production builds,
prototype regressions, React interaction tests, an independent package install,
HTTP smoke tests, and Playwright/axe checks for all apps. Before the first full
check, install the test browser with `pnpm exec playwright install chromium`. `pnpm format:check` checks formatting.

The original full prototype gallery remains accessible using
`pnpm build:preview && node dev-server.mjs` on port 5220. The React gallery
currently covers the exported library; additional original specimens (including
advanced editors and date pickers) remain reference implementations until ported.
No existing prototype is removed or silently embedded inside a React component.

## Cardlattice catalogue demo

Cardlattice opens directly into a searchable card grid, with set pages,
card identities, URL-persisted language/rarity/sort/view filters, grid and TanStack
table views, record metadata, coverage, documentation and a JSON download.
Try `/pokemon/sets/pokemon-base-set`,
`/pokemon/printings/pokemon-base-set-nl-global-004`, `/data`, and `/contribute`.
The demo downloads Cardlattice’s current public snapshot from
https://cardlattice-status.pages.dev/data/manifest.json, verifies the SHA-256,
byte size, revision, schema, record counts and printing references, then derives
filters and coverage from those records. The snapshot verified on 2026-11-25
contains 6,773 printings across 264 sets and five languages. It has no artwork;
missing images and metadata are shown explicitly. Card identities are provisional,
so equal names are not treated as equivalent identities.

Corrections and review decisions stay in browser localStorage and never update
the published catalogue. The JSON download preserves the original records.
Results, filters and page position are retained when opening cards and returning.
Unavailable or corrupt downloads show a retry action; there is no fixture fallback.
The initial snapshot download is about 7.5 MB before transfer compression.

Normal tests intercept requests with a small subset of real, attributed records;
run `CARDLATTICE_LIVE=1 pnpm exec playwright test e2e/cardlattice-live.spec.ts`
after building to exercise the published endpoint without mocks.

Launch it independently (build the shared package first):

```sh
pnpm --filter @imlunahey/components build
pnpm --filter @imlunahey/demo-cardlattice dev
```

For a Tailscale HTTPS preview, explicitly allow your tailnet hostname and bind
Vite to loopback so it can share the port with Tailscale Serve:

```sh
DEMO_ALLOWED_HOSTS=your-host.your-tailnet.ts.net pnpm --filter @imlunahey/demo-cardlattice exec vite --host 127.0.0.1 --port 5234 --strictPort
tailscale serve --bg --https=5234 http://127.0.0.1:5234
```
