import test from "node:test";
import assert from "node:assert/strict";
import { setup, fragment, wait, change, type, submit, clickText } from "./dom.mjs";
import { initViews, initImport } from "../packages/components/src/workflows/data.js";
import { initMedia } from "../packages/components/src/workflows/media.js";
import {
  initSharing,
  initKeys,
  initBilling,
} from "../packages/components/src/workflows/accounts.js";
import { initBoard, initComments } from "../packages/components/src/workflows/collaboration.js";
import { initMonitoring } from "../packages/components/src/workflows/monitoring.js";
const select = (label) => document.querySelector(`select[aria-label="${label}"]`);
test("saved views persist configuration, restore changes and duplicate/delete", () => {
  const d = setup(fragment()),
    { $ } = d;
  try {
    initViews();
    change(select("Project status"), "Paused");
    assert.match($("view-status").textContent, /2 projects/);
    type($("view-name"), "Paused projects");
    submit($("view-save-form"));
    assert.equal(JSON.parse(localStorage.getItem("luna-saved-views-v1")).length, 1);
    change(select("Project status"), "Active");
    $("view-reset").click();
    assert.equal(select("Project status").value, "Paused");
    $("view-duplicate").click();
    assert.equal(JSON.parse(localStorage.getItem("luna-saved-views-v1")).length, 2);
    $("view-delete").click();
    assert.equal(JSON.parse(localStorage.getItem("luna-saved-views-v1")).length, 1);
    assert.equal(document.querySelectorAll("select:not([hidden])").length, 0);
  } finally {
    d.close();
  }
});
test("CSV validation blocks import until corrected and exports actual records", () => {
  const d = setup(fragment()),
    { $ } = d;
  try {
    initImport();
    $("csv-sample").click();
    assert.equal($("csv-commit").disabled, true);
    type(document.querySelector('[aria-label="quantity for row 2"]'), "3");
    assert.equal($("csv-commit").disabled, false);
    $("csv-commit").click();
    assert.match($("csv-status").textContent, /complete/);
    assert.equal($("csv-commit").disabled, true);
    $("csv-export").click();
    assert.equal(d.downloads[0].name, "catalogue.csv");
  } finally {
    d.close();
  }
});
test("resource invitations reject duplicates and copy actual preview link", async () => {
  const d = setup(fragment()),
    { $ } = d;
  try {
    initSharing();
    $("share-open").click();
    const modal = $("workflow-share"),
      email = modal.querySelector("[type=email]");
    type(email, "luna@example.com");
    submit(modal.querySelector("form"));
    assert.equal(email.checkValidity(), false);
    type(email, "alex@example.com");
    submit(modal.querySelector("form"));
    assert.match(modal.textContent, /alex@example.com/);
    change(select("Permission for alex@example.com"), "Editor");
    assert.match($("share-dialog-status").textContent, /updated/);
    clickText(modal, "Copy link");
    await wait();
    assert.equal(d.clipboard[0], "https://example.test/#resource-sharing");
    clickText(modal, "Remove");
    assert.doesNotMatch(
      modal.querySelector(".workflow-person").parentElement.textContent,
      /alex@example.com/,
    );
  } finally {
    d.close();
  }
});
test("keys generate, dismiss secrets, rotate and revoke with confirmation", () => {
  const d = setup(fragment()),
    { $ } = d;
  try {
    initKeys();
    type($("key-name"), "Monitor");
    submit($("key-form"));
    assert.match($("key-reveal").querySelector("input").value, /^demo_/);
    clickText($("key-reveal"), "Done");
    assert.equal($("key-reveal").childElementCount, 0);
    clickText($("key-list"), "Rotate");
    assert.equal($("key-confirm").open, true);
    clickText($("key-confirm"), "Confirm");
    assert.equal($("key-reveal").hidden, false);
    clickText($("key-list"), "Revoke");
    clickText($("key-confirm"), "Confirm");
    assert.match($("key-list").textContent, /Revoked/);
    assert.equal($("key-list").querySelector("button").disabled, true);
  } finally {
    d.close();
  }
});
test("board keyboard movement and reordering preserve tasks", () => {
  const d = setup(fragment()),
    { $ } = d;
  try {
    initBoard();
    let task = document.querySelector("[data-task=a]");
    task.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", altKey: true, bubbles: true }),
    );
    task = document.querySelector("[data-task=a]");
    assert.match(task.closest("section").getAttribute("aria-label"), /In progress/);
    type($("board-title"), "Test task");
    submit($("board-add"));
    assert.match($("board-columns").textContent, /Test task/);
    assert.equal(document.querySelectorAll(".board-card").length, 5);
  } finally {
    d.close();
  }
});
test("comments escape markup, insert mentions, edit, reply and resolve", () => {
  const d = setup(fragment()),
    { $ } = d;
  try {
    initComments();
    type($("comment-text"), "Hi @Al");
    $("comment-text").selectionStart = $("comment-text").value.length;
    $("comment-text").dispatchEvent(new Event("input"));
    clickText($("comment-mentions"), "@Alex");
    assert.equal($("comment-text").value, "Hi @Alex ");
    type($("comment-text"), "<img src=x onerror=alert(1)>");
    submit($("comment-form"));
    let card = $("comment-list").lastElementChild;
    assert.equal(card.querySelector("img"), null);
    assert.match(card.textContent, /<img/);
    clickText(card, "Edit");
    type(card.querySelector("textarea"), "Updated");
    submit(card.querySelector("form"));
    card = $("comment-list").lastElementChild;
    const reply = card.querySelector("input");
    type(reply, "Reply");
    submit(reply.form);
    card = $("comment-list").lastElementChild;
    assert.match(card.textContent, /Reply/);
    clickText(card, "Resolve");
    assert.match($("comment-list").lastElementChild.textContent, /Resolved/);
  } finally {
    d.close();
  }
});
test("billing changes require confirmation and invoices download", () => {
  const d = setup(fragment()),
    { $ } = d;
  try {
    initBilling();
    change(select("Subscription plan"), "Performance");
    change(select("Billing interval"), "annual");
    assert.match($("billing-quote").textContent, /£360/);
    $("billing-review").click();
    assert.match($("billing-current").textContent, /Standard/);
    clickText($("billing-confirm"), "Confirm demo change");
    assert.match($("billing-current").textContent, /Performance/);
    $("billing-cancel").click();
    clickText($("billing-confirm"), "Confirm demo change");
    assert.match($("billing-state").textContent, /Cancels/);
    $("billing-cancel").click();
    assert.equal($("billing-state").textContent, "Active");
    clickText($("billing-invoices"), "Download");
    assert.equal(d.downloads[0].name, "INV-0042.txt");
  } finally {
    d.close();
  }
});
test("media renders real canvas edits and saves PNG copies", async () => {
  const d = setup(fragment()),
    { $ } = d;
  try {
    initMedia();
    await wait(150);
    assert.equal($("editor-save").disabled, false);
    assert.equal($("editor-canvas").width, 800);
    change(select("Crop aspect ratio"), "1");
    type($("editor-width"), "512");
    assert.equal($("editor-canvas").height, 512);
    $("editor-rotate").click();
    assert.equal($("editor-angle").textContent, "90°");
    submit($("editor-form"));
    await wait();
    assert.equal(document.querySelectorAll(".media-card").length, 4);
    $("editor-download").click();
    await wait();
    const image = d.downloads.at(-1);
    assert.equal(image.name, "edited-image.png");
    const buffer = Buffer.from(await image.blob.arrayBuffer());
    assert.equal(buffer.readUInt32BE(16), 512);
    assert.equal(buffer.readUInt32BE(20), 512);
    const checkbox = document.querySelector(".media-caption input");
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change"));
    $("media-delete").click();
    assert.equal(document.querySelectorAll(".media-card").length, 3);
    type($("editor-width"), "0");
    assert.equal($("editor-save").disabled, true);
    $("editor-reset").click();
    assert.equal(select("Crop aspect ratio").value, "original");
    assert.equal($("editor-canvas").width, 800);
    assert.equal($("editor-canvas").height, 533);
  } finally {
    d.close();
  }
});
test("dashboard controls update both real TanStack chart hosts", () => {
  const d = setup(fragment()),
    { $ } = d;
  try {
    initMonitoring();
    assert.equal($("workflow-cpu-chart").dataset.engine, "tanstack-charts");
    assert.equal($("workflow-latency-chart").dataset.engine, "tanstack-charts");
    change(select("Dashboard time range"), "900000");
    change(select("Display timezone"), "Asia/Tokyo");
    assert.match($("dashboard-time-status").textContent, /Asia\/Tokyo/);
    type($("dashboard-from"), "2026-11-24T08:00");
    type($("dashboard-to"), "2026-11-24T09:00");
    submit($("dashboard-absolute"));
    assert.match($("dashboard-time-status").textContent, /Paused/);
    type($("dashboard-to"), "2026-11-24T07:00");
    submit($("dashboard-absolute"));
    assert.match($("dashboard-time-status").textContent, /after/);
  } finally {
    d.close();
  }
});

test("invoice table sorts through TanStack and keeps downloads attached to the correct row", () => {
  const d = setup(fragment()),
    { $ } = d;
  try {
    initBilling();
    const host = $("billing-invoices");
    assert.equal(host.querySelector("table").dataset.engine, "tanstack-table");
    host.querySelector("th button").click();
    assert.equal(host.querySelector("th").getAttribute("aria-sort"), "ascending");
    assert.equal(host.querySelector("tbody tr td").textContent, "INV-0041");
    clickText(host, "Download");
    assert.equal(d.downloads[0].name, "INV-0041.txt");
    host.querySelector("th button").click();
    assert.equal(host.querySelector("th").getAttribute("aria-sort"), "descending");
    assert.equal(host.querySelector("tbody tr td").textContent, "INV-0042");
  } finally {
    d.close();
  }
});

test("discussion uses the shared attachment control with preview and reset", () => {
  const d = setup(fragment()),
    { $ } = d;
  try {
    initComments();
    const field = $("comment-attachment-field"),
      native = $("comment-file");
    assert.equal(native.hidden, true);
    assert.ok([...field.querySelectorAll("button")].some((b) => b.textContent === "Attach file"));
    const file = new Blob(["image"], { type: "image/png" });
    file.name = "example.png";
    Object.defineProperty(native, "files", { value: [file], configurable: true });
    native.dispatchEvent(new Event("change"));
    assert.equal(field.querySelector("img").alt, "Preview of example.png");
    type($("comment-text"), "Image attached");
    submit($("comment-form"));
    assert.equal(field.querySelector("img"), null);
    assert.equal(
      $("comment-list").lastElementChild.querySelector("img").alt,
      "Attached example.png",
    );
    assert.equal(field.querySelector("button:last-child").hidden, true);
  } finally {
    d.close();
  }
});
