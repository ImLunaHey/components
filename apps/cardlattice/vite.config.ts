import { demoConfig } from "../../scripts/vite-demo.ts";
const config = demoConfig(import.meta.url);
export default {
  ...config,
  server: {
    ...config.server,
    strictPort: true,
    allowedHosts: process.env.DEMO_ALLOWED_HOSTS?.split(",").filter(Boolean) ?? [],
  },
};
