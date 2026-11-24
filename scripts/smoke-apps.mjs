import { spawn } from "node:child_process";
import assert from "node:assert/strict";
const demos = ["gallery", "projects", "catalogue", "account", "cardlattice", "fleet"];
for (const [index, name] of demos.entries()) {
  const port = 5530 + index;
  const child = spawn(process.execPath, ["scripts/serve-app.mjs", name, String(port)], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(Error("Server startup timed out")), 5000);
      child.stdout.once("data", () => {
        clearTimeout(timeout);
        resolve();
      });
      child.once("exit", (code) => {
        clearTimeout(timeout);
        reject(Error(`Server exited ${code}`));
      });
    });
    const response = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<title>/);
    for (const match of html.matchAll(/(?:src|href)="(\/[^"#]+\.(?:js|css))"/g)) {
      const asset = await fetch(`http://127.0.0.1:${port}${match[1]}`);
      assert.equal(asset.status, 200, `${name}: ${match[1]}`);
    }
    console.log(`${name}: page and script/style assets served successfully`);
  } finally {
    child.kill("SIGTERM");
  }
}
