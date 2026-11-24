import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import stylex from "@stylexjs/unplugin";
import { fileURLToPath } from "node:url";
export function demoConfig(url: string) {
  return defineConfig({
    root: fileURLToPath(new URL(".", url)),
    plugins: [
      stylex.vite({
        useCSSLayers: true,
        runtimeInjection: false,
        unstable_moduleResolution: {
          type: "commonJS",
          rootDir: fileURLToPath(new URL("../", import.meta.url)),
        },
      }),
      react(),
    ],
    server: { fs: { allow: [fileURLToPath(new URL("../", import.meta.url))] } },
  });
}
