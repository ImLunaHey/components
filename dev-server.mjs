import http from "node:http";
import { readFile, stat, readdir, realpath } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL("./design/", import.meta.url));
const port = Number(process.env.PORT || 5220);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".webm": "video/webm",
  ".vtt": "text/vtt",
};
const routes = {
  "/": "component-library.html",
  "/cardlattice": "cardlattice-status-study.html",
  "/fleet": "fleet-monitor-study.html",
  "/fleet/fullscreen": "fleet-monitor-fullscreen.html",
  "/projects": "projects-demo.html",
  "/catalogue": "catalogue-demo.html",
  "/account": "account-demo.html",
};
const nav = `<nav class="dev-navigation" aria-label="Component playground"><a href="/">Components</a><a href="/cardlattice">Cardlattice</a><a href="/fleet">Fleet Monitor</a><a href="/fleet/fullscreen">Fleet fullscreen ↗</a><a href="/projects">Projects</a><a href="/catalogue">Catalogue</a><a href="/account">Account</a><span>Development preview</span></nav>`;
const css = `<style>body{background:var(--background,#111)}.dev-navigation{display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:14px 24px;border-bottom:1px solid #ffffff12;background:#111;color:#aaa;font:12px/1.5 system-ui}.dev-navigation a{color:inherit;text-decoration:none}.dev-navigation a[aria-current=page]{color:#eee}.dev-navigation a:hover{color:#eee}.dev-navigation span{margin-left:auto;font-size:11px}#library{max-width:1280px;margin:0 auto;padding:24px}#fleet-study:not(.fullscreen){padding:24px}#study{padding:24px}:root[data-theme=dark]{--background:#111;--card:#1e1e1e;--secondary:#292929;--border:#ffffff12;--success:#8ed6a0;--warning:#e5ae51;--destructive:#ee958c;--info:#89b9ed;--accent:#b9a2e8;--chart-1:#89b9ed}@media(max-width:600px){#library{padding:16px}.dev-navigation{gap:12px;padding:12px 16px}.dev-navigation span{display:none}}</style>`;
const client = `<script>document.querySelectorAll('.dev-navigation a').forEach(a=>{if(a.pathname===location.pathname)a.setAttribute('aria-current','page')});let revision;setInterval(async()=>{try{const r=await fetch('/__version',{cache:'no-store'});const next=await r.text();if(revision&&next!==revision)location.reload();revision=next}catch{}},1500);</script>`;

http
  .createServer(async (req, res) => {
    try {
      if (req.method !== "GET" && req.method !== "HEAD") {
        res.writeHead(405).end();
        return;
      }
      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      res.setHeader("Cache-Control", "no-store");
      if (pathname === "/__version") {
        const files = (await readdir(directory))
          .filter((name) => /\.(html|js|css)$/.test(name))
          .sort();
        const stamps = await Promise.all(
          files.map(async (name) => `${name}:${(await stat(resolve(directory, name))).mtimeMs}`),
        );
        res.writeHead(200, { "Content-Type": "text/plain" }).end(stamps.join("|"));
        return;
      }
      const path = await realpath(resolve(directory, routes[pathname] || "." + pathname));
      if (!path.startsWith(directory.replace(/\/$/, "") + sep) || !types[extname(path)]) {
        res.writeHead(404).end("Not found");
        return;
      }
      let content = await readFile(path);
      if (extname(path) === ".html") {
        let html = content.toString();
        const fullscreen = path.endsWith("fleet-monitor-fullscreen.html");
        if (!fullscreen)
          html = html.replace("</head>", css + "</head>").replace("<body>", "<body>" + nav);
        if (path.endsWith("component-library.html")) {
          html = html
            .replace('<html lang="en">', '<html lang="en" data-theme="dark">')
            .replace(
              'data-theme="light" aria-pressed="true"',
              'data-theme="light" aria-pressed="false"',
            )
            .replace(
              'data-theme="dark" aria-pressed="false"',
              'data-theme="dark" aria-pressed="true"',
            );
        }
        content = Buffer.from(html.replace("</body>", client + "</body>"));
      }
      res.writeHead(200, {
        "Content-Type": types[extname(path)],
        "Content-Length": content.length,
        "X-Content-Type-Options": "nosniff",
      });
      res.end(req.method === "HEAD" ? undefined : content);
    } catch (error) {
      res.writeHead(error.code === "ENOENT" ? 404 : 400).end("Not found");
    }
  })
  .listen(port, "127.0.0.1", () => console.log(`Component playground: http://127.0.0.1:${port}`));
