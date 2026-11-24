import test from "node:test";
import assert from "node:assert/strict";
import { setup, wait } from "./dom.mjs";
import { initProgressTooltips } from "../packages/components/src/progress-tooltips.js";

test("progress tooltip supports hover, focus, live values and Escape", async () => {
  const d = setup(
    '<span id="help">Existing help</span><div id="bar" role="progressbar" aria-label="Upload progress" aria-describedby="help" aria-valuenow="70" aria-valuemax="100" data-progress-detail="7 of 10 files uploaded"></div>',
  );
  const dispose = initProgressTooltips();
  try {
    const bar = d.$("bar"),
      tip = document.querySelector("[role=tooltip]");
    assert.equal(bar.tabIndex, 0);
    bar.dispatchEvent(new Event("pointerenter"));
    assert.equal(tip.hidden, false);
    assert.equal(tip.textContent, "Upload progress · 70% · 7 of 10 files uploaded");
    bar.setAttribute("aria-valuenow", "80");
    await wait();
    assert.match(tip.textContent, /80%/);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    assert.equal(tip.hidden, true);
    assert.equal(bar.getAttribute("aria-describedby"), "help");
    bar.focus();
    assert.equal(tip.hidden, false);
    bar.blur();
    assert.equal(tip.hidden, true);
  } finally {
    dispose();
    d.close();
  }
});
test("dynamic native progress and indeterminate states get tooltips", async () => {
  const d = setup(
    '<label>Export progress<progress id="native" max="10" value="3"></progress></label>',
  );
  const dispose = initProgressTooltips();
  try {
    d.$("native").focus();
    const tip = document.querySelector("[role=tooltip]");
    assert.equal(tip.textContent, "Export progress · 30%");
    const bar = document.createElement("progress");
    bar.setAttribute("aria-label", "Uploading");
    document.body.append(bar);
    await wait();
    assert.equal(bar.tabIndex, 0);
    bar.focus();
    assert.equal(tip.textContent, "Uploading · In progress");
    bar.max = 100;
    bar.value = 42;
    await wait();
    assert.equal(tip.textContent, "Uploading · 42%");
    bar.hidden = true;
    await wait();
    assert.equal(tip.hidden, true);
  } finally {
    dispose();
    d.close();
  }
});
