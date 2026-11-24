import { build } from "esbuild";
import { lintProject } from "./scripts/component-boundary.mjs";
const violations = await lintProject();
if (violations.length)
  throw new Error(violations.map((e) => `${e.file}:${e.line} ${e.message}`).join("\n"));
await import("./scripts/build-templates.mjs");
await import("./build-demos.mjs");

await build({
  entryPoints: {
    "gallery-enhancements": "packages/components/src/gallery.js",
    "app-demo": "src/app-demo.js",
    "cardlattice-tooltips": "packages/components/src/cardlattice-tooltips.js",
  },
  bundle: true,
  format: "esm",
  splitting: true,
  outdir: process.env.DEMO_OUTPUT || "design",
  entryNames: "[name]",
  chunkNames: "assets/js/[name]-[hash]",
  logLevel: "info",
});
