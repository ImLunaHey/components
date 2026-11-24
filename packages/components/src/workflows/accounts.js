import {
  $,
  el,
  button,
  input,
  field,
  picker,
  message,
  copy,
  table,
  dialog,
  download,
} from "./ui.js";
export function initSharing() {
  const modal = dialog("workflow-share", "Share Fleet dashboard"),
    accessHost = el("div"),
    people = el("div"),
    note = el(
      "p",
      "Invitations and link permissions are simulated in this preview.",
      "muted small",
    );
  const form = el("form", undefined, "stack"),
    email = input("Invite by email", "", "email");
  email.required = true;
  const roleHost = el("div");
  let role = "Viewer",
    access = "restricted",
    members = [{ email: "luna@example.com", role: "Owner" }],
    handles = [];
  form.append(field("Email address", email), roleHost);
  picker(
    roleHost,
    "Invite permission",
    ["Viewer", "Editor"],
    "Viewer",
    (v) => (role = v),
  );
  const submit = el("button", "Add demo invitation", "button primary");
  submit.type = "submit";
  form.append(submit);
  const url = input("Resource link", location.origin + location.pathname + "#resource-sharing");
  url.readOnly = true;
  modal.body.append(
    note,
    form,
    people,
    accessHost,
    field("Resource link", url),
    button("Copy link", () => copy(url.value, "share-dialog-status")),
  );
  picker(
    accessHost,
    "General access",
    [
      ["restricted", "Only invited people"],
      ["link", "Anyone with the link · Viewer"],
    ],
    "restricted",
    (v) => {
      access = v;
      message(
        "share-status",
        v === "restricted"
          ? "Demo access: only invited people."
          : "Demo access: anyone with the link can view.",
      );
    },
  );
  const live = el("p", "", "app-feedback");
  live.id = "share-dialog-status";
  live.setAttribute("role", "status");
  modal.body.append(live);
  function render() {
    handles.forEach((p) => p.destroy());
    handles = [];
    people.replaceChildren();
    for (const m of members) {
      const row = el("div", undefined, "workflow-person");
      row.append(el("span", m.email));
      if (m.role === "Owner") row.append(el("span", "Owner", "badge"));
      else {
        const host = el("div");
        row.append(host);
        handles.push(
          picker(
            host,
            "Permission for " + m.email,
            ["Viewer", "Editor"],
            m.role,
            (v) => {
              m.role = v;
              message("share-dialog-status", "Permission updated in preview.");
            },
          ),
        );
        row.append(
          button("Remove", () => {
            members = members.filter((x) => x !== m);
            render();
            email.focus();
            message("share-dialog-status", "Access removed in preview.");
          }),
        );
      }
      people.append(row);
    }
  }
  form.onsubmit = (e) => {
    e.preventDefault();
    email.setCustomValidity("");
    const value = email.value.trim().toLowerCase();
    if (members.some((m) => m.email === value))
      email.setCustomValidity("This person already has access.");
    if (!email.reportValidity()) return;
    members.push({ email: value, role });
    email.value = "";
    render();
    message("share-dialog-status", "Demo invitation added. No email was sent.");
  };
  email.oninput = () => email.setCustomValidity("");
  $("share-open").onclick = () => {
    render();
    modal.dialog.showModal();
  };
}
export function initKeys() {
  let scope = "Read only",
    expiry = "30",
    keys = [];
  picker(
    $("key-scope-control"),
    "Key permissions",
    ["Read only", "Read and write"],
    "Read only",
    (v) => (scope = v),
  );
  picker(
    $("key-expiry-control"),
    "Key expiry",
    [
      ["7", "7 days"],
      ["30", "30 days"],
      ["90", "90 days"],
    ],
    "30",
    (v) => (expiry = v),
  );
  const confirm = dialog("key-confirm", "Confirm key change");
  const text = el("p"),
    yes = button("Confirm", () => {}, "button danger");
  confirm.body.append(
    text,
    yes,
    button("Cancel", () => confirm.dialog.close()),
  );
  function reveal(key) {
    const host = $("key-reveal");
    host.hidden = false;
    const value = input("New demo key", key.secret);
    value.readOnly = true;
    host.replaceChildren(
      el("strong", "Copy this demo key before dismissing"),
      value,
      button("Copy demo key", () => copy(value.value, "key-status")),
      button("Done", () => {
        host.hidden = true;
        host.replaceChildren();
        key.secret = null;
      }),
    );
  }
  function newSecret() {
    return "demo_" + crypto.randomUUID().replaceAll("-", "");
  }
  function action(key, kind) {
    text.textContent =
      kind === "revoke"
        ? `Revoke “${key.name}”? It will be inactive in this preview.`
        : `Rotate “${key.name}”? This replaces the demo key.`;
    yes.onclick = () => {
      if (kind === "revoke") {
        key.revoked = true;
        key.secret = null;
        $("key-reveal").hidden = true;
        $("key-reveal").replaceChildren();
      } else {
        key.secret = newSecret();
        key.suffix = key.secret.slice(-6);
        reveal(key);
      }
      render();
      message(
        "key-status",
        kind === "revoke" ? "Demo key revoked." : "Demo key rotated.",
      );
      confirm.dialog.close();
    };
    confirm.dialog.showModal();
  }
  function render() {
    const host = $("key-list");
    host.replaceChildren();
    for (const key of keys) {
      const card = el("div", undefined, "key-record");
      card.append(
        el("strong", key.name),
        el("code", "demo_••••••" + key.suffix),
        el(
          "small",
          `${key.scope} · expires ${new Date(key.expires).toLocaleDateString("en-GB")} · ${key.revoked ? "Revoked" : "Active"}`,
          "muted",
        ),
      );
      const controls = el("div", undefined, "row");
      for (const kind of ["rotate", "revoke"]) {
        const b = button(kind === "rotate" ? "Rotate" : "Revoke", () =>
          action(key, kind),
        );
        b.disabled = key.revoked;
        controls.append(b);
      }
      card.append(controls);
      host.append(card);
    }
  }
  $("key-form").onsubmit = (e) => {
    e.preventDefault();
    const name = $("key-name").value.trim();
    if (!name) {
      $("key-name").setCustomValidity("Enter a key name.");
      $("key-name").reportValidity();
      return;
    }
    const secret = newSecret(),
      key = {
        name,
        secret,
        suffix: secret.slice(-6),
        scope,
        expires: Date.now() + Number(expiry) * 86400000,
        revoked: false,
      };
    keys.unshift(key);
    $("key-name").value = "";
    reveal(key);
    render();
    message(
      "key-status",
      "Demo key created locally. It grants no real access.",
    );
  };
  $("key-name").oninput = () => $("key-name").setCustomValidity("");
}
export function initBilling() {
  const plans = { Starter: 6, Standard: 18, Performance: 36 };
  let plan = "Standard",
    cycle = "monthly",
    current = { plan, cycle },
    cancelled = false,
    payment = "visa",
    invoices = [
      { id: "INV-0042", date: "2026-11-01", amount: "£18.00", status: "Paid" },
      { id: "INV-0041", date: "2026-10-01", amount: "£18.00", status: "Paid" },
    ];
  const amount = (p, c) => plans[p] * (c === "annual" ? 10 : 1);
  picker(
    $("billing-plan-control"),
    "Subscription plan",
    Object.keys(plans),
    plan,
    (v) => {
      plan = v;
      quote();
    },
  );
  picker(
    $("billing-cycle-control"),
    "Billing interval",
    [
      ["monthly", "Monthly"],
      ["annual", "Annual · 2 months free"],
    ],
    cycle,
    (v) => {
      cycle = v;
      quote();
    },
  );
  picker(
    $("billing-method-control"),
    "Demo payment method",
    [
      ["visa", "Demo Visa · ending 4242"],
      ["mastercard", "Demo Mastercard · ending 4444"],
    ],
    "visa",
    (v) => (payment = v),
  );
  const modal = dialog("billing-confirm", "Review subscription change"),
    summary = el("p"),
    apply = button("Confirm demo change", () => {}, "button primary");
  modal.body.append(
    summary,
    el(
      "p",
      "No charge will be made. This changes local sample data only.",
      "muted small",
    ),
    apply,
    button("Keep current plan", () => modal.dialog.close()),
  );
  function quote() {
    $("billing-quote").textContent =
      `£${amount(plan, cycle)} / ${cycle === "annual" ? "year" : "month"} · example pricing`;
    $("billing-current").textContent =
      `Current: ${current.plan}, ${current.cycle}. ${cancelled ? "Cancellation scheduled at the next renewal." : "Renews automatically."}`;
    $("billing-state").textContent = cancelled
      ? "Cancels at renewal"
      : "Active";
    $("billing-cancel").textContent = cancelled
      ? "Resume subscription"
      : "Cancel at renewal";
  }
  $("billing-review").onclick = () => {
    const next = { plan, cycle };
    summary.textContent = `Change from ${current.plan} (${current.cycle}) to ${plan} at £${amount(plan, cycle)} per ${cycle === "annual" ? "year" : "month"} on the next renewal.`;
    apply.onclick = () => {
      current = next;
      cancelled = false;
      quote();
      message("billing-status", "Plan change applied in this preview.");
      modal.dialog.close();
    };
    modal.dialog.showModal();
  };
  $("billing-cancel").onclick = () => {
    if (cancelled) {
      cancelled = false;
      quote();
      message("billing-status", "Demo subscription resumed.");
      return;
    }
    summary.textContent =
      "Cancel at the next renewal? Access remains available until then in this demo.";
    apply.onclick = () => {
      cancelled = true;
      quote();
      message("billing-status", "Cancellation scheduled in this preview.");
      modal.dialog.close();
    };
    modal.dialog.showModal();
  };
  $("billing-details").onsubmit = (e) => {
    e.preventDefault();
    if ($("billing-details").reportValidity())
      message(
        "billing-status",
        `Billing details saved locally for ${$("billing-email").value}. ${payment === "visa" ? "Demo Visa" : "Demo Mastercard"} selected.`,
      );
  };
  table(
    $("billing-invoices"),
    invoices,
    [
      { key: "id", label: "Invoice" },
      { key: "date", label: "Date" },
      { key: "amount", label: "Amount", align: "right" },
      { key: "status", label: "Status", render: row => el("span", row.status, "badge success") },
      {
        key: "download",
        label: "Receipt",
        align: "right",
        render: (row) =>
          button("Download", () =>
            download(
              `SAMPLE INVOICE — NOT A TAX DOCUMENT\n${row.id}\nDate: ${row.date}\nAmount: ${row.amount}\nStatus: ${row.status}\nNo payment was collected.\n`,
              row.id + ".txt",
            ),
          ),
      },
    ],
    "Sample invoices",
    { sortable: true },
  );
  quote();
}
