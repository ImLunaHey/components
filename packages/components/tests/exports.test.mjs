// @vitest-environment node
import { test } from "vitest";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
test("packed library installs outside the monorepo and every export resolves", () => {
  const temp = mkdtempSync(path.join(tmpdir(), "luna-ui-consumer-"));
  try {
    const pack = spawnSync("pnpm", ["pack", "--pack-destination", temp], { encoding: "utf8" });
    assert.equal(pack.status, 0, pack.stderr);
    const tarball = path.join(temp, "imlunahey-components-0.1.0.tgz");
    writeFileSync(
      path.join(temp, "package.json"),
      JSON.stringify({
        private: true,
        type: "module",
        dependencies: { "@imlunahey/components": "file:" + tarball },
      }),
    );
    const install = spawnSync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], {
      cwd: temp,
      encoding: "utf8",
    });
    assert.equal(install.status, 0, install.stderr);
    const code = `import {readFileSync} from 'node:fs'; for (const name of ['button','input','textarea','panel','badge','select','combobox','language-select','file-upload','data-table','dialog','progress','tabs','toggle','qr-code','theme','app-shell','line-chart','record-tile','description-list','filter-chip','pagination','empty-state','breadcrumbs','code-block','media-image']) await import('@imlunahey/components/'+name); if(!readFileSync(new URL(import.meta.resolve('@imlunahey/components/styles.css')),'utf8').includes('@layer'))throw Error('Missing styles');`;
    const result = spawnSync("node", ["--input-type=module", "-e", code], {
      cwd: temp,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
