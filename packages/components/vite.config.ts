import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import stylex from "@stylexjs/unplugin";
import { fileURLToPath } from "node:url";
const entries = [
  "button",
  "input",
  "textarea",
  "panel",
  "badge",
  "select",
  "combobox",
  "language-select",
  "file-upload",
  "data-table",
  "dialog",
  "progress",
  "tabs",
  "toggle",
  "qr-code",
  "theme",
  "app-shell",
  "line-chart",
  "record-tile",
  "description-list",
  "filter-chip",
  "pagination",
  "empty-state",
  "breadcrumbs",
  "code-block",
  "media-image",
];
export default defineConfig({
  plugins: [
    stylex.vite({
      useCSSLayers: true,
      runtimeInjection: false,
      unstable_moduleResolution: {
        type: "commonJS",
        rootDir: fileURLToPath(new URL("../../", import.meta.url)),
      },
    }),
    react(),
  ],
  build: {
    lib: {
      entry: Object.fromEntries(
        entries.map((name) => [
          name,
          fileURLToPath(new URL("./src/react/" + name + ".tsx", import.meta.url)),
        ]),
      ),
      formats: ["es"],
      fileName: (_format, name) => name + ".js",
      cssFileName: "components",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
  },
});
