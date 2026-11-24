import { JSDOM } from "jsdom";
import { createCanvas, Image as NativeImage } from "@napi-rs/canvas";
import fs from "node:fs";
export function setup(html) {
  const dom = new JSDOM(html, {
      runScripts: "outside-only",
      url: "https://example.test/",
      pretendToBeVisual: true,
    }),
    w = dom.window;
  for (const key of [
    "window",
    "document",
    "Node",
    "HTMLElement",
    "SVGElement",
    "HTMLCanvasElement",
    "Event",
    "CustomEvent",
    "KeyboardEvent",
    "Option",
    "FormData",
    "customElements",
    "location",
    "history",
    "localStorage",
    "MutationObserver",
    "getComputedStyle",
  ])
    globalThis[key] =
      key === "window" ? w : key === "getComputedStyle" ? w.getComputedStyle.bind(w) : w[key];
  globalThis.requestAnimationFrame = w.requestAnimationFrame.bind(w);
  globalThis.cancelAnimationFrame = w.cancelAnimationFrame.bind(w);
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  globalThis.matchMedia = w.matchMedia;
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.Element.prototype.getBoundingClientRect = function () {
    return { x: 0, y: 0, left: 0, top: 0, right: 600, bottom: 230, width: 600, height: 230 };
  };
  w.SVGElement.prototype.getBBox = function () {
    return { x: 0, y: 0, width: 60, height: 15 };
  };
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new w.Event("close"));
  };
  const blobs = new Map(),
    downloads = [];
  let serial = 0;
  URL.createObjectURL = (blob) => {
    const url = "blob:test-" + ++serial;
    blobs.set(url, blob);
    return url;
  };
  URL.revokeObjectURL = (url) => blobs.delete(url);
  w.HTMLAnchorElement.prototype.click = function () {
    downloads.push({ name: this.download, blob: blobs.get(this.href) });
  };
  const clipboard = [];
  Object.defineProperty(globalThis, "navigator", {
    value: { clipboard: { writeText: async (text) => clipboard.push(text) } },
    configurable: true,
  });
  function backing(node) {
    if (!node.__canvas) node.__canvas = createCanvas(node.width || 300, node.height || 150);
    if (node.__canvas.width !== node.width) node.__canvas.width = node.width;
    if (node.__canvas.height !== node.height) node.__canvas.height = node.height;
    return node.__canvas;
  }
  w.HTMLCanvasElement.prototype.getContext = function (type) {
    const c = backing(this),
      ctx = c.getContext(type);
    if (ctx && !ctx.__adapted) {
      const draw = ctx.drawImage.bind(ctx);
      ctx.drawImage = (source, ...args) =>
        draw(source instanceof w.HTMLCanvasElement ? backing(source) : source, ...args);
      ctx.__adapted = true;
    }
    return ctx;
  };
  w.HTMLCanvasElement.prototype.toBlob = function (cb, type) {
    cb(new Blob([backing(this).toBuffer(type || "image/png")], { type: type || "image/png" }));
  };
  globalThis.Image = class extends NativeImage {
    set src(value) {
      if (blobs.has(value)) {
        blobs
          .get(value)
          .arrayBuffer()
          .then((b) => {
            super.src = Buffer.from(b);
          })
          .catch((e) => this.onerror?.(e));
      } else super.src = value;
    }
  };
  w.eval(fs.readFileSync("design/pickers.js", "utf8"));
  globalThis.ComponentPickers = w.ComponentPickers;
  for (const select of w.document.querySelectorAll("select:not([data-custom-renderer])"))
    w.ComponentPickers.select(select);
  return {
    dom,
    w,
    blobs,
    downloads,
    clipboard,
    $: (id) => w.document.getElementById(id),
    close() {
      w.dispatchEvent(new w.Event("pagehide"));
      dom.window.close();
    },
  };
}
export const fragment = () => fs.readFileSync("design/workflow-components.html", "utf8");
export const wait = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms));
export function change(node, value) {
  node.value = value;
  node.dispatchEvent(new Event("change", { bubbles: true }));
}
export function type(node, value) {
  node.value = value;
  node.dispatchEvent(new Event("input", { bubbles: true }));
}
export function submit(node) {
  node.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}
export function clickText(host, text) {
  const button = [...host.querySelectorAll("button")].find((b) => b.textContent === text);
  if (!button) throw Error("Missing button: " + text);
  button.click();
  return button;
}
