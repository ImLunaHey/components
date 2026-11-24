import { createTable, getCoreRowModel, getSortedRowModel } from "@tanstack/table-core";
export const $ = (id) => document.getElementById(id);
export function el(tag, text, cls) {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  if (cls) n.className = cls;
  return n;
}
export function button(text, fn, cls = "button small-button") {
  const n = el("button", text, cls);
  n.type = "button";
  n.onclick = fn;
  return n;
}
export function field(text, input) {
  const n = el("label", undefined, "field");
  n.append(el("span", text), input);
  return n;
}
export function input(label, value = "", type = "text") {
  const n = el("input");
  n.type = type;
  n.value = value;
  n.setAttribute("aria-label", label);
  return n;
}
export function picker(host, label, values, value, onchange) {
  const n = el("select");
  n.setAttribute("aria-label", label);
  for (const v of values) {
    const [key, text] = Array.isArray(v) ? v : [v, v];
    n.append(new Option(text, key));
  }
  n.value = value;
  host.append(n);
  const api = window.ComponentPickers.select(n);
  n.onchange = () => onchange?.(n.value);
  return { native: n, ...api };
}
export function message(id, text, error = false) {
  $(id).textContent = text;
  $(id).classList.toggle("error", error);
}
export async function copy(text, status) {
  try {
    await navigator.clipboard.writeText(text);
    message(status, "Copied.");
  } catch {
    message(
      status,
      "Clipboard unavailable. Select and copy the displayed value.",
      true,
    );
  }
}
export function download(text, name, type = "text/plain") {
  const blob = text instanceof Blob ? text : new Blob([text], { type });
  const url = URL.createObjectURL(blob),
    a = el("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  const timer = setTimeout(() => URL.revokeObjectURL(url), 1000);
  return () => {
    clearTimeout(timer);
    URL.revokeObjectURL(url);
  };
}
export function table(host, rows, columns, label, options = {}) {
  let sorting = [];
  host.replaceChildren();
  const model = createTable({
    data: rows,
    columns: columns.map((c) => ({
      id: c.key,
      accessorFn: (row) => row[c.key],
      enableSorting: options.sortable === true && c.sortable !== false && !c.render,
    })),
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (update) => {
      sorting = typeof update === "function" ? update(sorting) : update;
      model.setOptions(old => ({ ...old, state: { ...old.state, sorting } }));
      render();
    },
  });
  const wrap = el("div", undefined, "table-wrap"),
    t = el("table", undefined, "app-table");
  t.dataset.engine = "tanstack-table";
  const caption = el("caption", label, "pc-sr");
  t.append(caption);
  function render() {
  t.tHead?.remove();
  t.tBodies[0]?.remove();
  const head = t.createTHead().insertRow();
  for (const c of columns) {
    const th = el("th", c.label);
    th.scope = "col";
    const column = model.getColumn(c.key);
    if (c.align) th.dataset.align = c.align;
    if (column.getCanSort()) {
      const direction = column.getIsSorted();
      th.setAttribute("aria-sort", direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none");
      const control = button(c.label, () => column.toggleSorting(), "table-sort");
      const arrow = el("span", direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕");
      arrow.setAttribute("aria-hidden", "true");
      control.append(arrow);
      th.replaceChildren(control);
    }
    head.append(th);
  }
  const body = t.createTBody();
  for (const r of model.getRowModel().rows) {
    const tr = body.insertRow();
    for (const c of columns) {
      const td = tr.insertCell();
      if (c.align) td.dataset.align = c.align;
      const value = c.render ? c.render(r.original) : r.original[c.key];
      if (value instanceof Node) td.append(value);
      else td.textContent = value ?? "—";
    }
  }
  if (!rows.length) {
    const td = body.insertRow().insertCell();
    td.colSpan = columns.length;
    td.textContent = "No matching records.";
  }
  }
  render();
  wrap.tabIndex = 0;
  wrap.setAttribute("role", "region");
  wrap.setAttribute("aria-label", label);
  wrap.append(t);
  host.append(wrap);
  return model;
}
export function dialog(id, title) {
  const d = el("dialog", undefined, "workflow-dialog");
  d.id = id;
  d.setAttribute("aria-labelledby", id + "-title");
  const header = el("header", undefined, "ui-card-header"),
    h = el("h3", title);
  h.id = id + "-title";
  const close = button("×", () => d.close());
  close.setAttribute("aria-label", "Close " + title);
  header.append(h, close);
  const body = el("div", undefined, "ui-card-body stack");
  d.append(header, body);
  let outside = false;
  const isOutside = (e) => {
    const r = d.getBoundingClientRect();
    return (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    );
  };
  d.addEventListener(
    "pointerdown",
    (e) => (outside = e.target === d && isOutside(e)),
  );
  d.addEventListener("click", (e) => {
    if (outside && e.target === d && isOutside(e)) d.close();
    outside = false;
  });
  document.body.append(d);
  return { dialog: d, body };
}
