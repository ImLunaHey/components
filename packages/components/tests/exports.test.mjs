import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { JSDOM } from "jsdom";
import { mountSelect } from "../dist/select.js";
import { mountFileAttachment } from "../dist/file-attachment.js";
import { table, picker } from "../dist/controls.js";
test("exported controls run without gallery globals", () => {
  const dom = new JSDOM("<main></main>", { url: "https://example.test" });
  for (const key of ["window", "document", "Node", "Option", "Event"])
    globalThis[key] = key === "window" ? dom.window : dom.window[key];
  try {
    const host = document.querySelector("main");
    const select = document.createElement("select");
    select.setAttribute("aria-label", "Language");
    select.add(new Option("English", "en"));
    host.append(select);
    const control = mountSelect(select);
    assert.equal(select.hidden, true);
    assert.equal(control.trigger.textContent.includes("English"), true);
    control.destroy();
    const field = picker(host, "Status", ["Active", "Paused"], "Active");
    assert.equal(field.native.hidden, true);
    const upload = mountFileAttachment(host, { id: "file" });
    assert.equal(upload.native.hidden, true);
    const container = document.createElement("section");
    host.append(container);
    table(container, [{ id: "Invoice 1" }], [{ key: "id", label: "Invoice" }], "Invoices");
    assert.equal(container.querySelector("table").dataset.engine, "tanstack-table");
    assert.match(readFileSync("dist/styles.css", "utf8"), /--background/);
  } finally {
    dom.window.close();
  }
});
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
    const code = `import {readFileSync} from 'node:fs'; for (const name of ['controls','select','file-attachment','progress-tooltips','qr-code','compile']) await import('@imlunahey/components/'+name); if(!readFileSync(new URL(import.meta.resolve('@imlunahey/components/styles.css')),'utf8').includes('--background'))throw Error('Missing styles');`;
    const result = spawnSync("node", ["--input-type=module", "-e", code], {
      cwd: temp,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
