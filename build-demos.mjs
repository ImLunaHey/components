import { mkdir } from "node:fs/promises";
const output = process.env.DEMO_OUTPUT || "design";
await mkdir(output, { recursive: true });
import { compileComponents } from "./packages/components/src/compile.mjs";
import { readFile, writeFile } from "node:fs/promises";
const gallery = await readFile(output + "/component-library.html", "utf8"),
  fragment = await readFile(output + "/workflow-components.html", "utf8");
const base = gallery.match(/<style>([\s\S]*?)<\/style>/)[1];
const specimens = new Map(
  [
    ...fragment.matchAll(/<article class="specimen(?: full)?" id="([^"]+)"[\s\S]*?<\/article>/g),
  ].map((m) => [m[1], m[0]]),
);
const apps = [
  {
    file: "projects-demo.html",
    title: "Orbit",
    subtitle: "Project tracker",
    heading: "Fleet Monitor",
    description: "Release 1.9 · infrastructure",
    items: [
      ["kanban-board", "Board"],
      ["saved-views", "Projects"],
      ["comment-threads", "Discussion"],
    ],
    extra: ["resource-sharing"],
  },
  {
    file: "catalogue-demo.html",
    title: "Shelf",
    subtitle: "Catalogue & media",
    heading: "Asset library",
    description: "Manage imagery and import your collection",
    items: [
      ["media-library", "Media library"],
      ["image-editor", "Image editor"],
      ["csv-import", "Import catalogue"],
    ],
    extra: [],
  },
  {
    file: "account-demo.html",
    title: "Control",
    subtitle: "Account & operations",
    heading: "Account settings",
    description: "Luna’s projects · local demo",
    items: [
      ["billing-panels", "Billing"],
      ["resource-sharing", "Sharing"],
      ["api-keys", "API keys"],
      ["dashboard-controls", "Monitoring"],
    ],
    extra: [],
  },
];
const navPaths = {
  "media-library":
    '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 16 5-5 4 4 3-3 6 6"/>',
  "image-editor": '<path d="M7 3v14h14M3 7h14v14"/>',
  "csv-import": '<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',
  "kanban-board":
    '<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="10" rx="1"/><rect x="17" y="4" width="4" height="13" rx="1"/>',
  "saved-views": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
  "comment-threads": '<path d="M4 4h16v12H9l-5 4zM8 8h8M8 12h5"/>',
  "billing-panels": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
  "resource-sharing":
    '<circle cx="8" cy="8" r="3"/><path d="M2 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 4 5"/>',
  "api-keys": '<circle cx="8" cy="8" r="4"/><path d="m11 11 9 9m-5-5 3-3m-1 5 3-3"/>',
  "dashboard-controls": '<path d="M3 18h18M3 4v14m3-5 4-5 4 3 5-7"/>',
};
const navIcon = (id) =>
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  navPaths[id] +
  "</svg>";

for (const app of apps) {
  const nav = app.items
    .map(
      ([id, label]) =>
        `<ui-button data-demo-pane="${id}" aria-current="false">${navIcon(id)}<span>${label}</span></ui-button>`,
    )
    .join("");
  const content = [...app.items.map(([id]) => id), ...app.extra]
    .map((id) => {
      if (!specimens.has(id)) throw Error("Missing " + id);
      return specimens.get(id).replace('class="specimen', 'data-demo-section class="specimen');
    })
    .join("\n");
  const html = `<!doctype html><html lang="en" data-theme="dark" data-app="${app.title}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${app.title} — ${app.subtitle}</title><style>${base}</style><link rel="stylesheet" href="/gallery-enhancements.css"><link rel="stylesheet" href="/pickers.css"><link rel="stylesheet" href="/data-components.css"><link rel="stylesheet" href="/app-components.css"><link rel="stylesheet" href="/surface-components.css"><link rel="stylesheet" href="/workflow-components.css"><link rel="stylesheet" href="/app-demo.css"></head><body><div class="demo-shell"><aside class="demo-sidebar" id="demo-sidebar"><div class="demo-brand"><span class="demo-brand-mark">${navIcon(app.items[0][0])}</span><span>${app.title}</span><span class="demo-brand-caption">Personal</span></div><span class="demo-nav-label">${app.title === "Shelf" ? "Catalogue" : app.title === "Orbit" ? "Project" : "Settings"}</span><nav aria-label="${app.title} navigation">${nav}</nav><div class="demo-sidebar-footer"><span class="demo-nav-label">Explore demos</span><nav aria-label="Other apps">${apps
    .filter((other) => other !== app)
    .map(
      (other) =>
        `<a href="/${other.title === "Shelf" ? "catalogue" : other.title === "Orbit" ? "projects" : "account"}">${navIcon(other.items[0][0])}<span>${other.title}</span><span class="demo-nav-hint">${other.title === "Shelf" ? "Media" : other.title === "Orbit" ? "Projects" : "Account"}</span></a>`,
    )
    .join(
      "",
    )}<a href="/">${navIcon("saved-views")}<span>Component library</span></a></nav><div class="demo-identity"><span class="avatar">LH</span><div>Luna’s projects<small>Personal account</small></div></div></div></aside><main class="demo-main"><header class="demo-topbar"><div class="row"><ui-button class="button small-button demo-mobile-nav" id="demo-menu" aria-controls="demo-sidebar" aria-expanded="false">Menu</ui-button><span class="muted">${app.title}</span><span aria-hidden="true">/</span><span id="demo-breadcrumb">${app.items[0][1]}</span></div><div class="row"><ui-button class="button small-button" id="demo-theme">Light mode</ui-button><span class="avatar">LH</span></div></header><div class="demo-page-heading"><div><p class="muted small">${app.description}</p><h1 id="demo-page-title">${app.heading}</h1></div><div id="demo-heading-actions"></div></div><div class="demo-content">${content}</div><footer class="demo-footer">Interactive sample data · changes stay in this browser</footer></main></div><script src="/pickers.js"></script><script type="module" src="/app-demo.js"></script></body></html>`;
  await writeFile(output + "/" + app.file, compileComponents(html));
}
