import { defineConfig } from "@playwright/test";
const apps = ["gallery", "projects", "catalogue", "account", "cardlattice", "fleet"];
export default defineConfig({
  testDir: "./e2e",
  workers: 4,
  use: { browserName: "chromium", headless: true },
  webServer: apps.map((name, index) => ({
    command: `node scripts/serve-app.mjs ${name} ${5630 + index}`,
    url: `http://127.0.0.1:${5630 + index}`,
    reuseExistingServer: false,
  })),
  outputDir: ".runtime/playwright-results",
  reporter: "list",
});
