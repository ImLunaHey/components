import { qrPayload, makeQR, qrSvg, paintQR } from "./qr-code.js";
const $ = (id) => document.getElementById(id);
const element = (tag, text, className) => {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
};

export function initSurfaceComponents() {
  const downloads = new Set();
  function download(blob, name) {
    const url = URL.createObjectURL(blob),
      link = element("a");
    downloads.add(url);
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      downloads.delete(url);
    }, 30000);
  }
  let qr = null;
  function renderQR() {
    const kind = $("qr-kind").value,
      wifi = kind === "wifi";
    $("qr-text-field").hidden = wifi;
    $("qr-wifi-fields").hidden = !wifi;
    $("qr-password-field").hidden = $("qr-security").value === "nopass";
    $("qr-text-label").textContent =
      kind === "text" ? "Text to encode" : "Website URL";
    $("qr-message").classList.remove("error");
    try {
      const payload = qrPayload({
        kind,
        text: $("qr-text").value,
        ssid: $("qr-ssid").value,
        password: $("qr-password").value,
        security: $("qr-security").value,
      });
      qr = makeQR(payload, $("qr-correction").value);
      // qrSvg contains only matrix coordinates and fixed markup, never user content.
      $("qr-preview").innerHTML = qrSvg(qr);
      $("qr-meta").textContent =
        `${qr.modules.size} × ${qr.modules.size} modules · ${$("qr-size").value} px PNG`;
      $("qr-message").textContent = "Ready to scan or download.";
    } catch (error) {
      qr = null;
      $("qr-preview").replaceChildren(
        element("p", "Enter valid content to generate a code."),
      );
      $("qr-meta").textContent = "Preview unavailable";
      $("qr-message").textContent = error.message;
      $("qr-message").classList.add("error");
    }
    $("qr-svg").disabled = $("qr-png").disabled = !qr;
  }
  for (const id of ["qr-kind", "qr-security", "qr-correction", "qr-size"])
    $(id).addEventListener("change", renderQR);
  for (const id of ["qr-text", "qr-ssid", "qr-password"])
    $(id).addEventListener("input", renderQR);
  $("qr-svg").onclick = () => {
    if (qr)
      download(new Blob([qrSvg(qr)], { type: "image/svg+xml" }), "qr-code.svg");
  };
  $("qr-png").onclick = () => {
    if (!qr) return;
    try {
      const canvas = paintQR(
        document.createElement("canvas"),
        qr,
        Number($("qr-size").value),
      );
      canvas.toBlob((blob) => {
        if (blob) {
          download(blob, "qr-code.png");
          $("qr-message").textContent = "PNG download ready.";
        } else {
          $("qr-message").textContent = "PNG export failed. Try SVG instead.";
        }
      }, "image/png");
    } catch (error) {
      $("qr-message").textContent = error.message;
    }
  };
  renderQR();

  const metrics = {
    "24h": {
      value: "128,430",
      change: "12.8% vs previous 24 hours",
      note: "24 hourly samples",
      success: "127,916",
      errors: "514",
      bars: [
        20, 18, 15, 16, 22, 35, 40, 48, 68, 72, 64, 59, 64, 76, 88, 84, 78, 69,
        75, 85, 95, 87, 90, 100,
      ],
    },
    "7d": {
      value: "842,106",
      change: "8.4% vs previous 7 days",
      note: "7 daily samples",
      success: "838,738",
      errors: "3,368",
      bars: [62, 68, 74, 65, 80, 91, 100],
    },
    "30d": {
      value: "3,641,280",
      change: "18.2% vs previous 30 days",
      note: "30 daily samples",
      success: "3,626,715",
      errors: "14,565",
      bars: [
        40, 45, 42, 50, 38, 49, 51, 60, 55, 58, 63, 66, 62, 58, 70, 74, 73, 69,
        77, 80, 76, 85, 81, 77, 89, 88, 92, 87, 96, 100,
      ],
    },
  };
  function renderMetric() {
    const data = metrics[$("metric-window").value];
    $("surface-metric-value").textContent = data.value;
    $("surface-metric-change").textContent = "↑ " + data.change;
    $("surface-metric-note").textContent = data.note + " · sample data";
    $("surface-metric-bars").replaceChildren(
      ...data.bars.map((height) => {
        const bar = element("span");
        bar.style.height = height + "%";
        return bar;
      }),
    );
    $("metric-detail").replaceChildren(
      ...[
        ["Successful", data.success],
        ["Failed", data.errors],
        ["Success rate", "99.6%"],
      ].map(([label, value]) => {
        const row = element("div");
        row.append(element("dt", label), element("dd", value));
        return row;
      }),
    );
  }
  $("metric-window").onchange = renderMetric;
  $("metric-inspect").onclick = () => {
    const open = $("metric-detail").hidden;
    $("metric-detail").hidden = !open;
    $("metric-inspect").setAttribute("aria-expanded", String(open));
  };
  renderMetric();
  $("resource-pin").onclick = () => {
    const pinned = $("resource-pin").getAttribute("aria-pressed") !== "true";
    $("resource-pin").setAttribute("aria-pressed", String(pinned));
    $("resource-pin").textContent = pinned ? "Pinned" : "Pin";
    $("resource-pin-status").textContent = pinned
      ? "Fleet Monitor pinned in this preview."
      : "Fleet Monitor unpinned.";
  };

  const readSettings = () => ({
    name: $("panel-name").value,
    environment: $("panel-environment").value,
    notify: $("panel-notify").checked,
  });
  let savedSettings = readSettings();
  function dirtySettings() {
    const dirty =
      JSON.stringify(readSettings()) !== JSON.stringify(savedSettings);
    $("panel-dirty").textContent = dirty ? "Unsaved" : "Saved";
    $("panel-dirty").classList.toggle("warning", dirty);
    $("panel-save").disabled = $("panel-discard").disabled = !dirty;
    $("panel-save-status").textContent = dirty
      ? "You have unsaved changes."
      : "Changes stay in this preview.";
  }
  $("surface-settings").addEventListener("input", () => {
    $("panel-name").setCustomValidity("");
    dirtySettings();
  });
  $("surface-settings").addEventListener("change", dirtySettings);
  $("surface-settings").onsubmit = (e) => {
    e.preventDefault();
    $("panel-name").setCustomValidity(
      $("panel-name").value.trim() ? "" : "Enter a project name.",
    );
    if (!$("surface-settings").reportValidity()) return;
    $("panel-name").value = $("panel-name").value.trim();
    savedSettings = readSettings();
    dirtySettings();
    $("panel-save-status").textContent =
      "Project preferences saved in this preview.";
  };
  $("panel-discard").onclick = () => {
    $("panel-name").value = savedSettings.name;
    $("panel-name").setCustomValidity("");
    $("panel-environment").value = savedSettings.environment;
    $("panel-notify").checked = savedSettings.notify;
    $("panel-environment").dispatchEvent(
      new Event("change", { bubbles: true }),
    );
    dirtySettings();
    $("panel-save-status").textContent = "Changes discarded.";
  };

  const tabs = [...document.querySelectorAll(".surface-tabs [role=tab]")];
  function activateTab(tab, focus = false) {
    for (const candidate of tabs) {
      const active = tab === candidate;
      candidate.setAttribute("aria-selected", String(active));
      candidate.tabIndex = active ? 0 : -1;
      $(candidate.getAttribute("aria-controls")).hidden = !active;
    }
    if (focus) tab.focus();
  }
  for (const tab of tabs) {
    tab.onclick = () => activateTab(tab);
    tab.onkeydown = (e) => {
      const i = tabs.indexOf(tab);
      let next;
      if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
      if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        e.preventDefault();
        activateTab(tabs[next], true);
      }
    };
  }
  const sizes = {
    starter: ["Starter", 6],
    standard: ["Standard", 18],
    performance: ["Performance", 36],
  };
  const selectedSize = () =>
    document.querySelector("[name=surface-instance]:checked").value;
  $("surface-options").onchange = () => {
    const [name, price] = sizes[selectedSize()];
    $("instance-summary").textContent =
      `${name} selected · £${price} / month · example pricing`;
    $("instance-apply").disabled = false;
  };
  $("instance-apply").onclick = () => {
    const [name] = sizes[selectedSize()];
    $("instance-summary").textContent =
      `${name} applied in this preview. No resources were provisioned.`;
    $("instance-apply").disabled = true;
  };

  let exports = [],
    exportTimer,
    lastExport = 0,
    failedOperation = null;
  function exportState(state) {
    const content = $("export-content");
    content.replaceChildren();
    $("async-surface").setAttribute("aria-busy", String(state === "loading"));
    $("export-refresh").disabled = state === "loading";
    $("export-clear").disabled = state === "loading" || !exports.length;
    if (state === "loading") {
      const skeleton = element("div", undefined, "panel-skeleton");
      skeleton.setAttribute("aria-hidden", "true");
      for (let i = 0; i < 3; i++) skeleton.append(element("span"));
      content.append(skeleton);
      $("export-status").textContent = "Loading exports…";
      return;
    }
    if (state === "error" || !exports.length) {
      const box = element("div", undefined, "surface-empty"),
        error = state === "error";
      box.append(
        element("strong", error ? "Couldn’t load exports" : "No exports yet"),
        element(
          "p",
          error
            ? "The sample request failed. Turn off “Simulate failure”, then retry."
            : "Create a sample export to see downloadable files in this panel.",
        ),
      );
      const button = element(
        "button",
        error ? "Retry" : "Create sample export",
        "button",
      );
      button.type = "button";
      button.onclick = () => loadExports(error ? failedOperation : true);
      box.append(button);
      content.append(box);
      $("export-status").textContent = error
        ? "Request failed."
        : "No exports yet.";
      return;
    }
    for (const item of exports) {
      const row = element("div", undefined, "export-row"),
        copy = element("div", item.name);
      copy.append(
        element("small", "CSV · 3 machines · created in this preview"),
      );
      const button = element("button", "Download", "button small-button");
      button.onclick = () =>
        download(
          new Blob(
            [
              "machine,state,cpu_percent\ntower,online,0.4\nnova,online,20.7\nlake,online,36.5\n",
            ],
            { type: "text/csv" },
          ),
          item.name,
        );
      row.append(copy, button);
      content.append(row);
    }
    $("export-status").textContent =
      exports.length +
      " export" +
      (exports.length === 1 ? "" : "s") +
      " ready.";
  }
  function loadExports(create = false) {
    clearTimeout(exportTimer);
    exportState("loading");
    exportTimer = setTimeout(() => {
      if ($("panel-simulate-error").checked) {
        failedOperation = create;
        exportState("error");
        return;
      }
      if (create) exports.unshift({ name: `fleet-export-${++lastExport}.csv` });
      exportState("ready");
    }, 650);
  }
  $("export-refresh").onclick = () => loadExports();
  $("export-clear").onclick = () => {
    clearTimeout(exportTimer);
    exports = [];
    exportState("ready");
  };
  exportState("ready");
  window.addEventListener(
    "pagehide",
    () => {
      clearTimeout(exportTimer);
      for (const url of downloads) URL.revokeObjectURL(url);
      downloads.clear();
    },
    { once: true },
  );
}
