import { build } from "esbuild";
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
await mkdir("dist", { recursive: true });
// The defining implementation is shared with the classic-script gallery adapter.
const pickers = (await readFile("src/pickers.js", "utf8")).replace(
  "window.ComponentPickers=",
  "const ComponentPickers=",
);
await writeFile(
  "dist/select.js",
  pickers +
    "\nexport function mountSelect(native, options) { return ComponentPickers.select(native, options); }\nexport function mountCombobox(input, items) { return ComponentPickers.combobox(input, items); }\n",
);
await build({
  entryPoints: {
    controls: "src/workflows/ui.js",
    "file-attachment": "src/file-attachment.js",
    "progress-tooltips": "src/progress-tooltips.js",
    "qr-code": "src/qr-code.js",
  },
  outdir: "dist",
  bundle: true,
  format: "esm",
  packages: "external",
});
const controls = await readFile("dist/controls.js", "utf8");
await writeFile(
  "dist/controls.js",
  'import { mountSelect } from "./select.js";\n' +
    controls.replace("window.ComponentPickers.select(n)", "mountSelect(n)"),
);
await copyFile("src/compile.mjs", "dist/compile.mjs");
const base = (await readFile("src/templates/component-library.html", "utf8")).match(
  /<style>([\s\S]*?)<\/style>/,
)[1];
const styles = [
  "pickers",
  "gallery-enhancements",
  "app-components",
  "surface-components",
  "workflow-components",
  "data-components",
];
await writeFile(
  "dist/styles.css",
  base +
    "\n" +
    (
      await Promise.all(styles.map((name) => readFile("../../design/" + name + ".css", "utf8")))
    ).join("\n"),
);
