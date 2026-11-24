import Papa from "papaparse";
import {
  $,
  el,
  button,
  input,
  field,
  picker,
  message,
  table,
  download,
} from "./ui.js";
export const projectRows = [
  { name: "Fleet Monitor", status: "Active", team: "Infrastructure" },
  { name: "Cardlattice", status: "Active", team: "Catalogue" },
  { name: "Checkout", status: "Paused", team: "Commerce" },
  { name: "Documentation", status: "Active", team: "Design" },
  { name: "Sandbox", status: "Paused", team: "Infrastructure" },
];
export function initViews() {
  const defaults = {
    search: "",
    status: "All",
    sort: "asc",
    layout: "table",
    team: true,
  };
  let config = { ...defaults },
    selected = "all",
    views = [];
  try {
    const parsed = JSON.parse(
      localStorage.getItem("luna-saved-views-v1") || "[]",
    );
    if (Array.isArray(parsed))
      views = parsed
        .filter(
          (v) =>
            v &&
            typeof v.name === "string" &&
            typeof v.id === "string" &&
            v.config,
        )
        .slice(0, 30)
        .map((v) => ({ ...v, config: { ...defaults, ...v.config } }));
  } catch {}
  const controls = $("views-controls"),
    savedHost = el("div"),
    statusHost = el("div"),
    sortHost = el("div"),
    layoutHost = el("div"),
    search = input("Search projects", "", "search");
  search.placeholder = "Search projects";
  controls.append(savedHost, search, statusHost, sortHost, layoutHost);
  let savedPicker;
  const statePicker = picker(
      statusHost,
      "Project status",
      ["All", "Active", "Paused"],
      "All",
      (v) => {
        config.status = v;
        render();
      },
    ),
    sortPicker = picker(
      sortHost,
      "Sort projects",
      [
        ["asc", "Name A–Z"],
        ["desc", "Name Z–A"],
      ],
      "asc",
      (v) => {
        config.sort = v;
        render();
      },
    ),
    layoutPicker = picker(
      layoutHost,
      "View layout",
      [
        ["table", "Table"],
        ["cards", "Cards"],
      ],
      "table",
      (v) => {
        config.layout = v;
        render();
      },
    );
  const team = input("Show team column", "", "checkbox");
  team.checked = true;
  const teamLabel = el("label", undefined, "check");
  teamLabel.append(team, el("span", "Show team"));
  $("view-columns").append(teamLabel);
  team.onchange = () => {
    config.team = team.checked;
    render();
  };
  search.oninput = () => {
    config.search = search.value;
    render();
  };
  function saveStorage() {
    try {
      localStorage.setItem("luna-saved-views-v1", JSON.stringify(views));
      return true;
    } catch {
      message(
        "view-status",
        "Browser storage unavailable; views will last for this visit.",
        true,
      );
      return false;
    }
  }
  function syncControls() {
    search.value = config.search;
    team.checked = !!config.team;
    for (const [api, value] of [
      [statePicker, config.status],
      [sortPicker, config.sort],
      [layoutPicker, config.layout],
    ]) {
      api.native.value = value;
      api.native.dispatchEvent(new Event("change"));
    }
  }
  function listViews() {
    savedPicker?.destroy();
    savedHost.replaceChildren();
    savedPicker = picker(
      savedHost,
      "Saved view",
      [["all", "All projects"], ...views.map((v) => [v.id, v.name])],
      selected,
      (v) => {
        selected = v;
        config = { ...defaults, ...views.find((x) => x.id === v)?.config };
        $("view-name").value = views.find((x) => x.id === v)?.name || "";
        syncControls();
        render();
      },
    );
  }
  function render() {
    const rows = projectRows
      .filter(
        (p) =>
          p.name.toLowerCase().includes(String(config.search).toLowerCase()) &&
          (config.status === "All" || p.status === config.status),
      )
      .sort(
        (a, b) =>
          (config.sort === "asc" ? 1 : -1) * a.name.localeCompare(b.name),
      );
    const host = $("view-results");
    if (config.layout === "cards") {
      host.replaceChildren();
      const grid = el("div", undefined, "workflow-card-grid");
      for (const p of rows) {
        const card = el("article", undefined, "ui-card ui-card-body");
        card.append(el("strong", p.name), el("p", p.status, "muted small"));
        if (config.team) card.append(el("p", p.team, "muted small"));
        grid.append(card);
      }
      if (!rows.length) grid.append(el("p", "No matching projects."));
      host.append(grid);
    } else
      table(
        host,
        rows,
        [
          { key: "name", label: "Project" },
          { key: "status", label: "State" },
          ...(config.team ? [{ key: "team", label: "Team" }] : []),
        ],
        "Projects in saved view",
      );
    $("view-delete").disabled = selected === "all";
    const base = views.find((v) => v.id === selected)?.config || defaults;
    message(
      "view-status",
      `${rows.length} projects · ${JSON.stringify(base) === JSON.stringify(config) ? "View up to date" : "Unsaved view changes"}`,
    );
  }
  $("view-save-form").onsubmit = (e) => {
    e.preventDefault();
    const name = $("view-name").value.trim();
    if (!name) {
      $("view-name").setCustomValidity("Enter a view name.");
      $("view-name").reportValidity();
      return;
    }
    if (
      views.some(
        (v) => v.name.toLowerCase() === name.toLowerCase() && v.id !== selected,
      )
    ) {
      message("view-status", "A view with that name already exists.", true);
      return;
    }
    if (selected === "all") {
      if (views.length >= 30) {
        message(
          "view-status",
          "Delete a view before adding more than 30.",
          true,
        );
        return;
      }
      selected = crypto.randomUUID();
      views.push({ id: selected, name, config: { ...config } });
    } else
      Object.assign(
        views.find((v) => v.id === selected),
        { name, config: { ...config } },
      );
    listViews();
    render();
    if (saveStorage()) message("view-status", "View saved in this browser.");
  };
  $("view-name").oninput = () => $("view-name").setCustomValidity("");
  $("view-reset").onclick = () => {
    config = { ...defaults, ...views.find((v) => v.id === selected)?.config };
    syncControls();
    render();
  };
  $("view-duplicate").onclick = () => {
    if (views.length >= 30) {
      message("view-status", "Maximum 30 views.", true);
      return;
    }
    let name = ($("view-name").value.trim() || "All projects") + " copy";
    while (views.some((v) => v.name === name)) name += " copy";
    selected = crypto.randomUUID();
    views.push({ id: selected, name, config: { ...config } });
    $("view-name").value = name;
    listViews();
    render();
    saveStorage();
  };
  $("view-delete").onclick = () => {
    views = views.filter((v) => v.id !== selected);
    selected = "all";
    config = { ...defaults };
    $("view-name").value = "";
    listViews();
    syncControls();
    render();
    saveStorage();
  };
  listViews();
  render();
}
export function parseImport(text) {
  const result = Papa.parse(text.replace(/^\uFEFF/, ""), {
    skipEmptyLines: "greedy",
  });
  if (result.errors.length) throw Error(result.errors[0].message);
  if (result.data.length < 2)
    throw Error("Include a header and at least one data row.");
  const headers = result.data[0].map((x) => x.trim());
  if (headers.some((x) => !x) || new Set(headers).size !== headers.length)
    throw Error("Column headers must be unique and nonempty.");
  if (result.data.length > 101 || headers.length > 30)
    throw Error("Use at most 100 data rows and 30 columns.");
  if (result.data.slice(1).some((r) => r.length !== headers.length))
    throw Error(
      "Every row must have the same number of columns as the header.",
    );
  return { headers, rows: result.data.slice(1) };
}
export function validateImport(row) {
  const errors = [];
  if (!row.name.trim()) errors.push("Name required");
  if (!/^\d+$/.test(row.quantity) || Number(row.quantity) > 1000000)
    errors.push("Quantity: whole number 0–1,000,000");
  if (!/^\d+(\.\d{1,2})?$/.test(row.price) || Number(row.price) > 1000000)
    errors.push("Price: 0–1,000,000, up to 2 decimals");
  return errors;
}
export function initImport() {
  let parsed = null,
    mapping = {},
    preview = [],
    imported = [],
    pickers = [],
    readVersion = 0;
  function renderRows() {
    table(
      $("csv-preview"),
      preview,
      [
        { key: "name", label: "Name", render: (r) => edit(r, "name") },
        {
          key: "quantity",
          label: "Quantity",
          render: (r) => edit(r, "quantity"),
        },
        { key: "price", label: "Price (£)", render: (r) => edit(r, "price") },
        {
          key: "errors",
          label: "Validation",
          render: (r) => {
            const note = el("span", validateImport(r).join(" · ") || "Ready");
            note.dataset.csvErrors = r.id;
            return note;
          },
        },
      ],
      "Import preview",
    );
    updateValidity();
  }
  function edit(row, key) {
    const n = input(key + " for row " + (row.id + 1), row[key]);
    n.oninput = () => {
      row[key] = n.value;
      const errors = validateImport(row);
      $("csv-preview").querySelector(
        `[data-csv-errors="${row.id}"]`,
      ).textContent = errors.join(" · ") || "Ready";
      updateValidity();
    };
    return n;
  }
  function updateValidity() {
    const invalid = preview.filter((r) => validateImport(r).length).length;
    const validMapping =
      Object.values(mapping).every((v) => v !== "") &&
      new Set(Object.values(mapping)).size === 3;
    $("csv-commit").disabled = !preview.length || invalid > 0 || !validMapping;
    message(
      "csv-status",
      !validMapping
        ? "Map each field to a different column."
        : `${preview.length} rows · ${invalid} need corrections.`,
      !validMapping || invalid > 0,
    );
  }
  function remap() {
    preview = parsed.rows.map((r, id) => ({
      id,
      name: r[Number(mapping.name)] || "",
      quantity: r[Number(mapping.quantity)] || "",
      price: r[Number(mapping.price)] || "",
    }));
    renderRows();
  }
  function load(text) {
    try {
      parsed = parseImport(text);
      pickers.forEach((p) => p.destroy());
      pickers = [];
      $("csv-mapping").replaceChildren();
      mapping = {};
      for (const [key, label] of [
        ["name", "Item name"],
        ["quantity", "Quantity"],
        ["price", "Unit price"],
      ]) {
        const host = el("div");
        $("csv-mapping").append(host);
        const guess = parsed.headers.findIndex((h) =>
          h.toLowerCase().includes(key === "name" ? "name" : key),
        );
        mapping[key] = guess >= 0 ? String(guess) : "";
        pickers.push(
          picker(
            host,
            label,
            [
              ["", "Map " + label],
              ...parsed.headers.map((h, i) => [String(i), h]),
            ],
            mapping[key],
            (v) => {
              mapping[key] = v;
              remap();
            },
          ),
        );
      }
      remap();
    } catch (error) {
      parsed = null;
      preview = [];
      pickers.forEach((p) => p.destroy());
      pickers = [];
      $("csv-mapping").replaceChildren();
      $("csv-preview").replaceChildren();
      $("csv-commit").disabled = true;
      message("csv-status", error.message, true);
    }
  }
  $("csv-browse").onclick = () => $("csv-file").click();
  $("csv-file").onchange = async (e) => {
    const version = ++readVersion,
      f = e.target.files[0];
    if (!f) return;
    $("csv-file-name").textContent = f.name;
    if (f.size > 1024 * 1024) {
      $("csv-reset").click();
      message("csv-status", "Choose a CSV under 1 MB.", true);
      return;
    }
    try {
      const text = await f.text();
      if (version === readVersion) load(text);
    } catch {
      message("csv-status", "Could not read this file.", true);
    }
  };
  $("csv-sample").onclick = () => {
    $("csv-file-name").textContent = "Sample catalogue.csv";
    readVersion++;
    load(
      'Item name,Quantity,Unit price\n"Pikachu, promo",2,12.50\nEevee,invalid,5.00\nCharizard,1,80.00',
    );
  };
  $("csv-commit").onclick = () => {
    if ($("csv-commit").disabled) return;
    imported.push(
      ...preview.map((r) => ({
        name: r.name.trim(),
        quantity: Number(r.quantity),
        price: Number(r.price),
      })),
    );
    $("csv-export").disabled = false;
    $("csv-commit").disabled = true;
    preview = [];
    $("csv-preview").replaceChildren(
      el("p", `${imported.length} records in this local catalogue.`),
    );
    message(
      "csv-status",
      "Import complete. Download the catalogue or choose another file.",
    );
  };
  $("csv-reset").onclick = () => {
    readVersion++;
    parsed = null;
    preview = [];
    pickers.forEach((p) => p.destroy());
    pickers = [];
    $("csv-mapping").replaceChildren();
    $("csv-preview").replaceChildren();
    $("csv-file").value = "";
    $("csv-file-name").textContent = "Choose a CSV file";
    $("csv-commit").disabled = true;
    message(
      "csv-status",
      "Choose a file or load the example. Existing imported records are retained.",
    );
  };
  $("csv-export").onclick = () =>
    download(
      Papa.unparse(imported, { escapeFormulae: true }),
      "catalogue.csv",
      "text/csv",
    );
}
