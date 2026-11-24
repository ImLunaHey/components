import { createTable, getCoreRowModel } from "@tanstack/table-core";
const $ = (id) => document.getElementById(id);
function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
function button(label, action, className = "button small-button") {
  const b = node("button", className, label);
  b.type = "button";
  b.onclick = action;
  return b;
}
function select(parent, label, values, value, onChange, handles) {
  const native = node("select");
  native.setAttribute("aria-label", label);
  for (const item of values) {
    const [key, text] = Array.isArray(item) ? item : [item, item];
    native.append(new Option(text, key));
  }
  native.value = value;
  parent.append(native);
  const picker = ComponentPickers.select(native);
  handles?.push(picker);
  native.onchange = () => onChange(native.value);
  return picker;
}

export function initAppComponents() {
  const projects = [
    {
      id: "fleet",
      name: "Fleet Monitor",
      team: "Infrastructure",
      environment: "Production",
      status: "Active",
      limit: 10000,
      initials: "FM",
    },
    {
      id: "cards",
      name: "Cardlattice",
      team: "Catalogue",
      environment: "Production",
      status: "Active",
      limit: 5000,
      initials: "CL",
    },
    {
      id: "components",
      name: "Component library",
      team: "Design",
      environment: "Preview",
      status: "Active",
      limit: 1000,
      initials: "UI",
    },
    {
      id: "checkout",
      name: "Checkout",
      team: "Commerce",
      environment: "Production",
      status: "Paused",
      limit: 2500,
      initials: "CO",
    },
    {
      id: "docs",
      name: "Documentation",
      team: "Design",
      environment: "Preview",
      status: "Active",
      limit: 500,
      initials: "DO",
    },
    {
      id: "sandbox",
      name: "Sandbox",
      team: "Infrastructure",
      environment: "Development",
      status: "Paused",
      limit: 100,
      initials: "SB",
    },
  ];
  const events = [
    {
      type: "deployment",
      title: "Fleet Monitor deployed to production",
      actor: "Luna H.",
      time: "09:42",
      detail:
        "Version 1.8.2 · 32 checks passed · deployment completed in 48 seconds.",
    },
    {
      type: "access",
      title: "Alex joined the workspace",
      actor: "Luna H.",
      time: "09:25",
      detail: "Alex was given Editor access to projects and resources.",
    },
    {
      type: "settings",
      title: "Cardlattice run limit changed",
      actor: "Alex K.",
      time: "09:10",
      detail: "Daily run limit increased from 2,000 to 5,000.",
    },
    {
      type: "file",
      title: "Brand assets uploaded",
      actor: "Ella M.",
      time: "Yesterday",
      detail: "3 SVG files were added to the component library.",
    },
    {
      type: "deployment",
      title: "Documentation preview published",
      actor: "Sam M.",
      time: "Yesterday",
      detail: "Preview build completed. Production was not changed.",
    },
    {
      type: "access",
      title: "Sam’s access changed to Viewer",
      actor: "Luna H.",
      time: "Yesterday",
      detail: "Sam can view and export project data.",
    },
    {
      type: "settings",
      title: "Sandbox paused",
      actor: "Luna H.",
      time: "Monday",
      detail: "Scheduled runs are paused until the project is enabled again.",
    },
  ];
  let activityLimit = 4;
  function renderActivity() {
    const type = $("activity-type").value,
      q = $("activity-search").value.toLowerCase();
    const matching = events.filter(
      (e) =>
        (type === "all" || e.type === type) &&
        `${e.title} ${e.actor} ${e.detail}`.toLowerCase().includes(q),
    );
    $("app-activity").replaceChildren();
    for (const e of matching.slice(0, activityLimit)) {
      const li = node("li"),
        details = node("details"),
        summary = node("summary"),
        copy = node("span", "activity-copy");
      copy.append(
        node("strong", "", e.title),
        node("small", "", e.actor + " · " + e.type),
      );
      summary.append(
        node(
          "span",
          "activity-mark",
          { deployment: "↗", settings: "≡", access: "◎", file: "↑" }[e.type],
        ),
        copy,
        node("span", "activity-time", e.time),
      );
      details.append(summary, node("p", "activity-details", e.detail));
      li.append(details);
      $("app-activity").append(li);
    }
    if (!matching.length)
      $("app-activity").append(
        node("li", "app-empty", "No activity matches your search."),
      );
    $("activity-count").textContent =
      `Showing ${Math.min(activityLimit, matching.length)} of ${matching.length} events`;
    $("activity-more").hidden = activityLimit >= matching.length;
  }
  function record(type, title, detail) {
    events.unshift({ type, title, detail, actor: "You", time: "Just now" });
    renderActivity();
  }
  $("activity-type").onchange = $("activity-search").oninput = () => {
    activityLimit = 4;
    renderActivity();
  };
  $("activity-more").onclick = () => {
    activityLimit += 4;
    renderActivity();
  };
  renderActivity();

  function renderResource() {
    const p = projects.find((p) => p.id === $("app-resource").value);
    const dl = node("dl", "resource-details");
    for (const [key, value] of [
      ["Team", p.team],
      ["Environment", p.environment],
      ["State", p.status],
      ["Daily runs", p.limit.toLocaleString()],
    ]) {
      const group = node("div");
      group.append(node("dt", "", key), node("dd", "", value));
      dl.append(group);
    }
    $("resource-details").replaceWith(dl);
    dl.id = "resource-details";
  }
  const resourcePicker = ComponentPickers.select($("app-resource"), {
    searchable: true,
    keywords: Object.fromEntries(
      projects.map((p) => [p.id, p.team + " " + p.environment]),
    ),
    renderOption: (option) => {
      const p = projects.find((p) => p.id === option.value),
        row = node("span", "resource-option"),
        copy = node("span", "", p.name);
      copy.append(
        node("small", "", p.team + " · " + p.environment + " · " + p.status),
      );
      row.append(node("span", "resource-symbol", p.initials), copy);
      return row;
    },
  });
  $("app-resource").onchange = () => {
    renderResource();
    $("resource-feedback").textContent =
      "Working in " +
      projects.find((p) => p.id === $("app-resource").value).name;
  };
  renderResource();

  const fields = {
    status: { label: "State", values: ["Active", "Paused"] },
    environment: {
      label: "Environment",
      values: ["Production", "Preview", "Development"],
    },
    team: {
      label: "Team",
      values: ["Infrastructure", "Catalogue", "Design", "Commerce"],
    },
  };
  let rules = [{ id: 1, field: "status", value: "Active" }],
    nextRule = 2,
    rulePickers = [];
  function matches() {
    const result = projects.filter(
      (p) =>
        !rules.length ||
        ($("filter-mode").value === "all"
          ? rules.every((r) => p[r.field] === r.value)
          : rules.some((r) => p[r.field] === r.value)),
    );
    $("filter-results").replaceChildren(
      node(
        "strong",
        "",
        `${result.length} matching project${result.length === 1 ? "" : "s"}`,
      ),
    );
    const list = node("ul");
    for (const p of result) list.append(node("li", "", p.name));
    if (!result.length)
      list.append(
        node("li", "muted", "Try removing a rule or matching any rule."),
      );
    $("filter-results").append(list);
  }
  function renderRules() {
    rulePickers.forEach((p) => p.destroy());
    rulePickers = [];
    $("filter-rules").replaceChildren();
    for (const rule of rules) {
      const row = node("div", "filter-rule"),
        field = node("div"),
        value = node("div");
      select(
        field,
        "Rule " + rule.id + " field",
        Object.entries(fields).map(([key, value]) => [key, value.label]),
        rule.field,
        (next) => {
          rule.field = next;
          rule.value = fields[next].values[0];
          renderRules();
          queueMicrotask(() =>
            rulePickers[rules.indexOf(rule) * 2]?.trigger.focus(),
          );
        },
        rulePickers,
      );
      select(
        value,
        "Rule " + rule.id + " value",
        fields[rule.field].values,
        rule.value,
        (next) => {
          rule.value = next;
          matches();
        },
        rulePickers,
      );
      const remove = button("×", () => {
        rules = rules.filter((r) => r !== rule);
        renderRules();
        $("filter-add").focus();
      });
      remove.setAttribute("aria-label", "Remove rule " + rule.id);
      row.append(field, node("span", "", "is"), value, remove);
      $("filter-rules").append(row);
    }
    $("filter-add").disabled = rules.length >= 6;
    matches();
  }
  $("filter-add").onclick = () => {
    if (rules.length >= 6) return;
    rules.push({ id: nextRule++, field: "environment", value: "Production" });
    renderRules();
    rulePickers.at(-2)?.trigger.focus();
  };
  $("filter-reset").onclick = () => {
    rules = [{ id: nextRule++, field: "status", value: "Active" }];
    $("filter-mode").value = "all";
    $("filter-mode").dispatchEvent(new Event("change"));
    renderRules();
  };
  $("filter-mode").onchange = matches;
  renderRules();

  let editing = null,
    editPicker;
  const table = createTable({
    data: projects,
    columns: [
      { accessorKey: "name" },
      { accessorKey: "limit" },
      { accessorKey: "status" },
    ],
    state: {},
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });
  function renderProjects() {
    editPicker?.destroy();
    editPicker = null;
    const body = $("editable-projects").tBodies[0];
    body.replaceChildren();
    for (const row of table.getRowModel().rows) {
      const project = row.original,
        tr = body.insertRow(),
        name = tr.insertCell(),
        limit = tr.insertCell(),
        status = tr.insertCell(),
        actions = tr.insertCell();
      if (editing === project.id) {
        tr.className = "editing-row";
        const nameInput = node("input"),
          limitInput = node("input");
        nameInput.value = project.name;
        nameInput.required = true;
        nameInput.maxLength = 60;
        nameInput.setAttribute("aria-label", "Project name");
        limitInput.type = "number";
        limitInput.min = "1";
        limitInput.max = "100000";
        limitInput.step = "1";
        limitInput.required = true;
        limitInput.value = project.limit;
        limitInput.setAttribute("aria-label", "Daily run limit");
        name.append(nameInput);
        limit.append(limitInput);
        let nextStatus = project.status;
        editPicker = select(
          status,
          "Project state",
          ["Active", "Paused"],
          nextStatus,
          (value) => {
            nextStatus = value;
          },
        );
        const cancel = () => {
          editing = null;
          renderProjects();
          $("editable-feedback").textContent = "Changes discarded.";
          body.querySelector(`[data-edit-project="${project.id}"]`)?.focus();
        };
        const save = () => {
          if (!nameInput.value.trim()) {
            nameInput.setCustomValidity("Enter a project name.");
          } else {
            nameInput.setCustomValidity("");
          }
          if (!nameInput.reportValidity() || !limitInput.reportValidity())
            return;
          const before = `${project.name} · ${project.limit.toLocaleString()} runs/day · ${project.status}`;
          Object.assign(project, {
            name: nameInput.value.trim(),
            limit: Number(limitInput.value),
            status: nextStatus,
          });
          table.setOptions((old) => ({ ...old, data: [...projects] }));
          const option = [...$("app-resource").options].find(
            (o) => o.value === project.id,
          );
          option.textContent = project.name;
          resourcePicker.sync();
          editing = null;
          renderProjects();
          renderResource();
          matches();
          $("editable-feedback").textContent = "Saved " + project.name;
          record(
            "settings",
            project.name + " settings updated",
            before +
              " → " +
              project.name +
              " · " +
              project.limit.toLocaleString() +
              " runs/day · " +
              project.status,
          );
          body.querySelector(`[data-edit-project="${project.id}"]`)?.focus();
        };
        const controls = node("div", "row");
        controls.append(
          button("Save", save, "button small-button primary"),
          button("Cancel", cancel),
        );
        actions.append(controls);
        nameInput.oninput = () => nameInput.setCustomValidity("");
        tr.onkeydown = (e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            cancel();
          } else if (e.key === "Enter" && e.target.tagName === "INPUT") {
            e.preventDefault();
            save();
          }
        };
        queueMicrotask(() => nameInput.focus());
      } else {
        name.textContent = project.name;
        limit.textContent = project.limit.toLocaleString();
        status.append(
          node(
            "span",
            "badge " + (project.status === "Active" ? "success" : ""),
            project.status,
          ),
        );
        const edit = button("Edit", () => {
          editing = project.id;
          renderProjects();
        });
        edit.dataset.editProject = project.id;
        edit.disabled = editing !== null;
        edit.setAttribute("aria-label", "Edit " + project.name);
        actions.append(edit);
      }
    }
  }
  $("editable-projects").dataset.engine = "tanstack-table";
  renderProjects();

  let members = [
      { id: 1, name: "Luna H.", email: "luna@example.com", role: "Owner" },
      { id: 2, name: "Alex K.", email: "alex@example.com", role: "Editor" },
      { id: 3, name: "Sam M.", email: "sam@example.com", role: "Viewer" },
    ],
    draft = structuredClone(members),
    nextMember = 4,
    memberPickers = [];
  const capabilities = {
    Owner: "Full access · workspace ownership",
    Admin: "Manage members, projects and settings",
    Editor: "Create and edit projects",
    Viewer: "View projects and export data",
  };
  const memberTable = createTable({
    data: draft,
    columns: [{ accessorKey: "name" }, { accessorKey: "role" }],
    state: {},
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
  });
  function dirtyAccess() {
    const dirty = JSON.stringify(draft) !== JSON.stringify(members);
    $("access-save").disabled = $("access-discard").disabled = !dirty;
    $("access-feedback").textContent = dirty
      ? "Unsaved changes."
      : "No unsaved changes.";
    $("access-feedback").classList.remove("error");
  }
  function renderMembers() {
    memberPickers.forEach((p) => p.destroy());
    memberPickers = [];
    memberTable.setOptions((old) => ({ ...old, data: draft }));
    const body = $("access-table").tBodies[0];
    body.replaceChildren();
    for (const row of memberTable.getRowModel().rows) {
      const m = row.original,
        tr = body.insertRow(),
        person = tr.insertCell(),
        role = tr.insertCell(),
        can = tr.insertCell(),
        actions = tr.insertCell();
      const identity = node("div", "member-detail"),
        copy = node("div", "", m.name);
      copy.append(node("small", "", m.email));
      identity.append(
        node("span", "avatar", m.name.slice(0, 2).toUpperCase()),
        copy,
      );
      person.append(identity);
      can.textContent = capabilities[m.role];
      if (m.role === "Owner") {
        role.textContent = "Owner";
        actions.append(node("span", "muted", "Owner"));
      } else {
        select(
          role,
          "Role for " + m.email,
          ["Viewer", "Editor", "Admin"],
          m.role,
          (value) => {
            m.role = value;
            can.textContent = capabilities[value];
            dirtyAccess();
          },
          memberPickers,
        );
        const remove = button(
          "Remove",
          () => {
            draft = draft.filter((item) => item.id !== m.id);
            renderMembers();
            dirtyAccess();
            $("member-email").focus();
          },
          "button small-button ghost",
        );
        remove.setAttribute("aria-label", "Remove " + m.email);
        actions.append(remove);
      }
    }
  }
  $("member-add").onsubmit = (e) => {
    e.preventDefault();
    const input = $("member-email"),
      email = input.value.trim().toLowerCase();
    if (draft.some((m) => m.email.toLowerCase() === email)) {
      input.setCustomValidity("This person already has access.");
      input.reportValidity();
      return;
    }
    if (!input.reportValidity()) return;
    draft = [
      ...draft,
      {
        id: nextMember++,
        name: email.split("@")[0],
        email,
        role: $("member-role").value,
      },
    ];
    input.value = "";
    renderMembers();
    dirtyAccess();
    input.focus();
  };
  $("member-email").oninput = () => {
    $("member-email").setCustomValidity("");
  };
  $("access-discard").onclick = () => {
    draft = structuredClone(members);
    renderMembers();
    dirtyAccess();
    $("access-feedback").textContent = "Changes discarded.";
  };
  $("access-save").onclick = () => {
    const added = draft.filter((m) => !members.some((old) => old.id === m.id)),
      removed = members.filter((m) => !draft.some((next) => next.id === m.id)),
      changed = draft.filter((m) =>
        members.some((old) => old.id === m.id && old.role !== m.role),
      );
    members = structuredClone(draft);
    dirtyAccess();
    $("access-feedback").textContent = "Workspace access saved.";
    record(
      "access",
      "Workspace access updated",
      [
        ...added.map((m) => `Added ${m.email} as ${m.role}`),
        ...changed.map((m) => `${m.email} is now ${m.role}`),
        ...removed.map((m) => `Removed ${m.email}`),
      ].join(". "),
    );
  };
  $("access-table").dataset.engine = "tanstack-table";
  renderMembers();

  // The queue UI accepts any transfer implementation with progress and cancellation.
  // This gallery adapter simulates a destination; it never sends file bytes.
  function demoTransfer(file, { signal, onProgress }) {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const abort = () => {
        clearInterval(timer);
        reject(new DOMException("Cancelled", "AbortError"));
      };
      const timer = setInterval(() => {
        progress += 10;
        onProgress(progress);
        if (progress >= 100) {
          clearInterval(timer);
          signal.removeEventListener("abort", abort);
          resolve();
        }
      }, 140);
      signal.addEventListener("abort", abort, { once: true });
    });
  }
  const queue = new Map();
  let nextUpload = 1;
  function queueSummary() {
    $("queue-feedback").textContent = queue.size
      ? `${queue.size} files · ${[...queue.values()].filter((item) => item.state === "complete").length} completed · ${[...queue.values()].filter((item) => item.state === "uploading").length} transferring`
      : "No files queued.";
    $("queue-clear").disabled = ![...queue.values()].some(
      (item) => item.state === "complete",
    );
  }
  function drawUpload(item) {
    item.meta.textContent =
      (item.error ||
        {
          queued: "Queued",
          uploading: "Transferring " + item.progress + "%",
          cancelled: "Cancelled",
          complete: "Complete · demo destination",
        }[item.state]) +
      " · " +
      (item.file.size / 1024).toFixed(1) +
      " KB";
    item.meta.classList.toggle("error", !!item.error);
    item.progressEl.value = item.progress;
    item.progressEl.hidden = item.state !== "uploading";
    item.actions.replaceChildren();
    if (item.state === "uploading")
      item.actions.append(
        button("Cancel", () => {
          item.controller.abort();
          item.state = "cancelled";
          drawUpload(item);
          queueSummary();
        }),
      );
    if (item.state === "cancelled")
      item.actions.append(button("Retry", () => startUpload(item)));
    item.actions.append(
      button("Remove", () => removeUpload(item), "button small-button ghost"),
    );
    queueSummary();
  }
  async function startUpload(item) {
    item.controller = new AbortController();
    const controller = item.controller;
    item.state = "uploading";
    item.progress = 0;
    drawUpload(item);
    try {
      await demoTransfer(item.file, {
        signal: controller.signal,
        onProgress: (value) => {
          if (queue.has(item.id) && item.controller === controller) {
            item.progress = value;
            drawUpload(item);
          }
        },
      });
      if (!queue.has(item.id) || item.controller !== controller) return;
      item.state = "complete";
      drawUpload(item);
      record(
        "file",
        item.file.name + " upload completed",
        "Demo transfer · " +
          (item.file.size / 1024).toFixed(1) +
          " KB · no file data left this device.",
      );
    } catch (error) {
      if (!queue.has(item.id) || item.controller !== controller) return;
      item.state = error.name === "AbortError" ? "cancelled" : "error";
      if (item.state === "error") item.error = "Transfer failed. Try again.";
      drawUpload(item);
    }
  }
  function removeUpload(item) {
    item.controller?.abort();
    if (item.url) URL.revokeObjectURL(item.url);
    queue.delete(item.id);
    item.el.remove();
    queueSummary();
  }
  function addFiles(files) {
    for (const file of files) {
      const item = { id: nextUpload++, file, state: "queued", progress: 0 },
        li = node("li", "upload-item");
      item.el = li;
      li.dataset.uploadId = item.id;
      const allowed =
        file.type.startsWith("image/") ||
        /\.(pdf|txt|csv|json)$/i.test(file.name);
      item.error =
        file.size > 10 * 1024 * 1024
          ? "File exceeds the 10 MB limit."
          : !allowed
            ? "Unsupported file type."
            : null;
      let thumbnail;
      if (file.type.startsWith("image/") && !item.error) {
        thumbnail = node("img", "upload-thumb");
        thumbnail.alt = "Preview of " + file.name;
        item.url = URL.createObjectURL(file);
        thumbnail.src = item.url;
        thumbnail.onerror = () => {
          thumbnail.replaceWith(node("span", "upload-thumb", "Image"));
        };
      } else
        thumbnail = node(
          "span",
          "upload-thumb",
          file.name.split(".").at(-1).slice(0, 5).toUpperCase(),
        );
      const copy = node("div"),
        name = node("strong", "upload-name", file.name);
      name.title = file.name;
      item.meta = node("span", "upload-meta");
      item.progressEl = node("progress");
      item.progressEl.max = 100;
      item.progressEl.setAttribute(
        "aria-label",
        "Upload progress for " + file.name,
      );
      copy.append(name, item.meta, item.progressEl);
      item.actions = node("div", "row");
      li.append(thumbnail, copy, item.actions);
      queue.set(item.id, item);
      $("upload-items").append(li);
      if (item.error) {
        item.state = "error";
        drawUpload(item);
      } else startUpload(item);
    }
  }
  $("queue-browse").onclick = () => $("queue-files").click();
  $("queue-files").onchange = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };
  const drop = $("queue-drop");
  drop.ondragover = (e) => {
    e.preventDefault();
    drop.classList.add("dragover");
  };
  drop.ondragleave = (e) => {
    if (!drop.contains(e.relatedTarget)) drop.classList.remove("dragover");
  };
  drop.ondrop = (e) => {
    e.preventDefault();
    drop.classList.remove("dragover");
    addFiles(e.dataTransfer.files);
  };
  $("queue-clear").onclick = () => {
    [...queue.values()]
      .filter((item) => item.state === "complete")
      .forEach(removeUpload);
  };
  queueSummary();
  window.addEventListener(
    "pagehide",
    () => {
      resourcePicker.destroy();
      rulePickers.forEach((p) => p.destroy());
      editPicker?.destroy();
      memberPickers.forEach((p) => p.destroy());
      queue.forEach((item) => {
        item.controller?.abort();
        if (item.url) URL.revokeObjectURL(item.url);
      });
      queue.clear();
    },
    { once: true },
  );
}
