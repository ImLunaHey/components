import { initProgressTooltips } from "../packages/components/src/progress-tooltips.js";
import { initWorkflowComponents } from "../packages/components/src/workflow-components.js";
for (const select of document.querySelectorAll("select:not([hidden])"))
  window.ComponentPickers.select(select);
const buttons = [...document.querySelectorAll("[data-demo-pane]")],
  sections = [...document.querySelectorAll("[data-demo-section]")];
function navigate(id) {
  const active = buttons.find((b) => b.dataset.demoPane === id) || buttons[0];
  id = active.dataset.demoPane;
  for (const s of sections) s.hidden = s.id !== id;
  for (const b of buttons) b.setAttribute("aria-current", b === active ? "page" : "false");
  document.getElementById("demo-breadcrumb").textContent = active.textContent;
  document.getElementById("demo-page-title").textContent = active.textContent;
  history.replaceState(null, "", "#" + id);
  document.getElementById("demo-sidebar").classList.remove("mobile-open");
  document.getElementById("demo-menu").setAttribute("aria-expanded", "false");
  window.dispatchEvent(new Event("resize"));
}
for (const b of buttons) b.onclick = () => navigate(b.dataset.demoPane);
window.addEventListener("demo:navigate", (e) => navigate(e.detail));
window.addEventListener("hashchange", () => navigate(location.hash.slice(1)));
document.getElementById("demo-menu").onclick = () => {
  const open = document.getElementById("demo-sidebar").classList.toggle("mobile-open");
  document.getElementById("demo-menu").setAttribute("aria-expanded", String(open));
};
document.getElementById("demo-theme").onclick = (e) => {
  const dark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  e.currentTarget.textContent = dark ? "Light mode" : "Dark mode";
};
initWorkflowComponents();
if (document.documentElement.dataset.app === "Orbit") {
  const share = document.getElementById("share-open");
  document.getElementById("demo-heading-actions").append(share);
}
navigate(location.hash.slice(1));

const disposeProgressTooltips = initProgressTooltips();
window.addEventListener("pagehide", disposeProgressTooltips, { once: true });
