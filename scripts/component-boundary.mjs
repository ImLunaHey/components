import {
  lintSource as checkSource,
  lintProject as checkProject,
} from "@imlunahey/oxlint-config/boundary";
import path from "node:path";
import { fileURLToPath } from "node:url";
const options = {
  componentDirectories: ["packages/components/src"],
  ignoreDirectories: ["design", "tests", "docs", "vendor"],
};
export function lintSource(source, filename) {
  return checkSource(source, filename, options);
}
export function lintProject(root = process.cwd()) {
  return checkProject(root, options);
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const errors = await lintProject();
  for (const error of errors)
    console.error(`${error.file}:${error.line}:${error.column} ${error.message}`);
  process.exitCode = errors.length ? 1 : 0;
}
