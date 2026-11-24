# Luna components

A pnpm + Turborepo workspace containing `@imlunahey/components` and six launchable
app demos. The reusable Oxlint package lives separately in
[ImLunaHey/oxlint-config](https://github.com/ImLunaHey/oxlint-config).

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm dev                         # all six apps
pnpm --filter @imlunahey/demo-catalogue dev  # one built app
# Or build and launch one app, including dependencies:
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

`PORT` overrides a single app's port. `start` serves an existing build; `dev`
currently serves the generated build too (rebuild after edits). Every app has its
own `dist` and can run without the combined preview server. Fleet also exposes
`/fleet/fullscreen`. Existing combined preview remains available through
`pnpm build:preview && node dev-server.mjs` on port 5220.

## Import the components

```sh
pnpm --filter @imlunahey/components pack --pack-destination ../../artifacts
# In another project:
pnpm add /path/to/artifacts/imlunahey-components-0.1.0.tgz
```

```js
import "@imlunahey/components/styles.css";
import { mountSelect } from "@imlunahey/components/select";
import { mountFileAttachment } from "@imlunahey/components/file-attachment";
import { table } from "@imlunahey/components/controls";
```

See [package API and lifecycle notes](packages/components/README.md). These are
the existing custom DOM components, not React wrappers. No registry publication
has occurred. The package has explicit subpath exports and no handwritten barrel.

## Source and validation

- `packages/components/src`: component implementations and specimen templates.
- `src/pages`: authored Fleet/Cardlattice study templates.
- `apps/*`: app package manifests, launch commands and generated builds.
- `design/*.css` and `design/assets/examples`: authored styling and sample media.
- `design/*.html`, `design/*.js`, `design/assets/js`: generated legacy preview.

`pnpm check` runs Oxlint, the HTML boundary check, all Turbo builds, prototype
interaction tests and the package consumer test. `pnpm format:check` checks
formatting. The consumer test packs and installs the component library in a
fresh directory and imports every exported module.

Native controls are restricted to `packages/components/src`. App templates use
`ui-*` references; file uploads use the shared attachment component. The build
imports `@imlunahey/oxlint-config/boundary`, and `oxlint.config.ts` imports the
same package's Oxlint preset. `vendor/` contains the exact bootstrap tarball,
so CI does not need credentials to read a second private repo. Replace this
versioned dependency when adopting a later lint release; do not edit the archive.

This extraction preserves the existing CSS, JavaScript DOM implementations and
Node test runner. It deliberately does not redesign the UI or migrate it to
React/Tailwind/Vitest. Existing hash-based demo panes are retained. The exported
stylesheet currently includes global base styles. See `docs/prototype-notes.md`
for the pre-extraction implementation notes.
