import reference from "../html-reference.json";
import { $, el, message, copy } from "./workflows/ui.js";
export function initHtmlElements() {
  if (!$("html-elements")) return;
  const groups = reference.filter(
      (g) => g.group !== "Obsolete and deprecated elements",
    ),
    names = groups.flatMap((g) => g.elements),
    experimental = ["selectedcontent", "geolocation"];
  $("html-coverage-summary").textContent =
    `${names.length - experimental.length} elements represented in examples or the page shell; ${experimental.length} experimental elements documented separately. Deprecated elements are excluded.`;
  for (const name of names) {
    const code = el("code", name);
    code.dataset.state = experimental.includes(name) ? "documented" : "covered";
    code.title = experimental.includes(name)
      ? "Experimental: documented, not a required control"
      : "Covered by a rendered example, hidden form model, or page/document structure";
    $("html-coverage-list").append(code);
  }
  $("html-find").oninput = () => {
    const q = $("html-find").value.trim().toLowerCase();
    const matches = names.filter((n) => n.includes(q));
    for (const item of $("html-coverage-list").children)
      item.hidden = !!q && !item.textContent.includes(q);
    $("html-find-result").value = matches.length
      ? matches.join(", ")
      : "No matching supported element.";
  };
  $("html-form").onsubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    $("html-form-status").value =
      `Valid form · ${data.get("name")} · quantity ${data.get("quantity")}. Nothing was submitted.`;
  };
  $("html-form").onreset = () => {
    $("html-form-status").value = "Form reset to its defaults.";
  };
  $("html-help").onclick = () =>
    ($("html-form-status").value =
      "This form demonstrates native input types with theme styling and custom select rendering.");
  document.querySelector("[data-html-copy]").onclick = () =>
    copy("Example semantic HTML content", "html-find-result");
  $("html-dialog-open").onclick = () => $("html-dialog").showModal();
  if (!customElements.get("luna-html-card"))
    customElements.define(
      "luna-html-card",
      class extends HTMLElement {
        connectedCallback() {
          if (this.shadowRoot) return;
          this.attachShadow({ mode: "open" }).append(
            $("html-card-template").content.cloneNode(true),
          );
        }
      },
    );
  const ctx = $("html-canvas").getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#292929";
    ctx.fillRect(0, 12, 300, 24);
    ctx.fillStyle = "#89b9ed";
    ctx.fillRect(0, 12, 195, 24);
  }
}
