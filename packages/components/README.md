# @imlunahey/components

Custom DOM components with shared light/dark styles. These are framework-independent
DOM APIs, not React components. Import defining modules directly; there is no barrel.

```js
import "@imlunahey/components/styles.css";
import { mountSelect, mountCombobox } from "@imlunahey/components/select";
import { mountFileAttachment } from "@imlunahey/components/file-attachment";
import { initProgressTooltips } from "@imlunahey/components/progress-tooltips";
import { table, button, input, dialog } from "@imlunahey/components/controls";

mountFileAttachment(document.querySelector("#attachment"), { id: "upload" });
```

Mount DOM APIs in a client lifecycle, after elements exist. `mountSelect` wraps a
native select with the custom picker while preserving form values and events.
Call its `destroy()` when disposing the picker. Progress tooltip initialization
returns a cleanup function. Table rendering uses TanStack Table.

Set `data-theme="dark"` or `data-theme="light"` on the document element. Styles
currently include the prototype's global base styles: adopt them at an app boundary,
not inside an unrelated page expecting fully scoped CSS.

From this repository: `pnpm --filter @imlunahey/components build`, then
`pnpm --filter @imlunahey/components pack --pack-destination ../../artifacts`.
Install the resulting tarball in any project with `pnpm add /path/to/package.tgz`.
No npm registry release has been published yet.
