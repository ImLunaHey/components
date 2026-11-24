import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";
import { setup, wait } from "./dom.mjs";
const gallery = fs.readFileSync("design/component-library.html", "utf8");
test("gallery has unique IDs and all nonexperimental supported HTML elements are represented", () => {
  const doc = new JSDOM(gallery).window.document;
  const ids = [...doc.querySelectorAll("[id]")].map((n) => n.id);
  assert.equal(new Set(ids).size, ids.length);
  const tags = new Set();
  function collect(root) {
    for (const n of root.querySelectorAll("*")) {
      tags.add(n.localName);
      if (n.localName === "template") collect(n.content);
      if (n.localName === "iframe" && n.srcdoc) collect(new JSDOM(n.srcdoc).window.document);
    }
  }
  collect(doc);
  const groups = JSON.parse(fs.readFileSync("docs/html-reference.json", "utf8"));
  const missing = groups
    .filter((g) => !g.group.includes("Obsolete"))
    .flatMap((g) => g.elements)
    .filter((n) => !["selectedcontent", "geolocation"].includes(n) && !tags.has(n));
  assert.deepEqual(missing, []);
  for (const file of ["workflow-components.html", "html-elements.html"])
    assert.ok(
      gallery.includes(fs.readFileSync("design/" + file, "utf8").trim()),
      file + " fragment synced",
    );
  assert.ok(!fs.existsSync("design/workspace-study.html"));
  assert.ok(!fs.readFileSync("dev-server.mjs", "utf8").includes("'/workspace'"));
});
for (const [file, id, app] of [
  ["projects-demo.html", "kanban-board", "Orbit"],
  ["catalogue-demo.html", "media-library", "Shelf"],
  ["account-demo.html", "billing-panels", "Control"],
])
  test(app + " app mounts workflows and switches pages", async () => {
    const d = setup(fs.readFileSync("design/" + file, "utf8"));
    try {
      await import("../src/app-demo.js?" + app);
      await wait(150);
      assert.equal(document.querySelectorAll("[data-demo-section]:not([hidden])").length, 1);
      assert.equal(document.querySelector("[data-demo-section]:not([hidden])").id, id);
      const nav = [...document.querySelectorAll("[data-demo-pane]")];
      for (const button of nav) {
        button.click();
        assert.equal(
          document.querySelector("[data-demo-section]:not([hidden])").id,
          button.dataset.demoPane,
        );
        assert.equal(button.getAttribute("aria-current"), "page");
      }
      assert.equal(document.querySelectorAll("select:not([hidden])").length, 0);
      document.getElementById("demo-theme").click();
      assert.equal(document.documentElement.dataset.theme, "light");
      if (app === "Shelf") {
        nav[0].click();
        document.querySelector(".media-preview").click();
        const edit = [...document.querySelectorAll("#media-inspector button")].find(
          (b) => b.textContent === "Edit image",
        );
        edit.click();
        assert.equal(
          document.querySelector("[data-demo-section]:not([hidden])").id,
          "image-editor",
        );
      }
    } finally {
      d.close();
    }
  });
