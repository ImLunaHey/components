import { lunaConfig } from "@imlunahey/oxlint-config/config";
import { REACT_DOCTOR_RULE_REGISTRY } from "oxlint-plugin-react-doctor/core";
const base = lunaConfig({ componentDirectories: ["packages/components/src"] });
const capabilities = new Set([
  "react",
  "react:19",
  "react:19.2",
  "typescript",
  "client-only",
  "tanstack-table",
]);
// The Oxlint plugin exposes registry metadata rather than an ESLint config preset.
const reactRules = Object.fromEntries(
  Object.entries(REACT_DOCTOR_RULE_REGISTRY)
    .filter(
      ([, rule]) =>
        rule.defaultEnabled !== false &&
        !rule.isScanRule &&
        rule.framework === "global" &&
        (!rule.requires || rule.requires.every((capability) => capabilities.has(capability))),
    )
    .map(([name, rule]) => ["react-doctor/" + name, rule.severity]),
);
export default {
  ...base,
  jsPlugins: [...base.jsPlugins, { name: "react-doctor", specifier: "oxlint-plugin-react-doctor" }],
  settings: { "react-doctor": { capabilities: [...capabilities] } },
  ignorePatterns: ["design/**", "**/dist/**", "**/node_modules/**", "tests/**", "**/tests/**"],
  // Preserve prototype diagnostics while enforcing rules in the new React sources.
  categories: { correctness: "off" },
  overrides: [
    {
      files: ["apps/**/*.tsx", "src/demos/**/*.tsx", "packages/components/src/react/**/*.tsx"],
      rules: reactRules,
    },
  ],
};
