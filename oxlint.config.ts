import { lunaConfig } from "@imlunahey/oxlint-config/config";
export default {
  ...lunaConfig({ componentDirectories: ["packages/components/src"] }),
  ignorePatterns: [
    "design/**",
    "**/dist/**",
    "**/node_modules/**",
    "tests/**",
    "**/tests/**",
    "vendor/**",
  ],
  // Existing prototype code is migrated without changing its behavior in this packaging change.
  categories: { correctness: "off" },
};
