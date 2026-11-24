import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const name = process.argv[2];
const entries = {
  gallery: "component-library.html",
  projects: "projects-demo.html",
  catalogue: "catalogue-demo.html",
  account: "account-demo.html",
  cardlattice: "cardlattice-status-study.html",
  fleet: "fleet-monitor-study.html",
};
if (!entries[name]) throw Error("Unknown demo");
const root = fileURLToPath(new URL(`../apps/${name}/dist/`, import.meta.url));
await stat(path.join(root, entries[name]));
const port = Number(process.env.PORT || process.argv[3]);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webm": "video/webm",
  ".wav": "audio/wav",
  ".vtt": "text/vtt",
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      const route =
        url.pathname === "/"
          ? entries[name]
          : url.pathname === "/fleet/fullscreen"
            ? "fleet-monitor-fullscreen.html"
            : (entries[url.pathname.slice(1)] ??
              decodeURIComponent(url.pathname).replace(/^\//, ""));
      const file = path.resolve(root, route);
      if (!file.startsWith(root)) {
        res.writeHead(403).end();
        return;
      }
      const content = await readFile(file);
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] ?? "application/octet-stream",
      });
      res.end(content);
    } catch {
      if (!res.headersSent) res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(port, "0.0.0.0", () => console.log(`${name}: http://localhost:${port}`));
