import { test } from "vitest";
import assert from "node:assert/strict";
import { parseImport, validateImport } from "../packages/components/src/workflows/data.js";
import { cropBounds } from "../packages/components/src/workflows/media.js";
import { exactRange, telemetry } from "../packages/components/src/workflows/monitoring.js";
test("CSV quoted fields, multiline values, invalid headers and cell validation", () => {
  const parsed = parseImport('name,quantity,price\n"One, two",2,4.00\n"Multi\nline",0,0');
  assert.deepEqual(parsed.rows[0], ["One, two", "2", "4.00"]);
  assert.equal(parsed.rows[1][0], "Multi\nline");
  assert.throws(() => parseImport("name,name\na,b"), /unique/);
  assert.throws(() => parseImport("a,b\n1,2,3"), /same number/);
  assert.throws(() => parseImport('a,b\n"oops,2'), /quote/i);
  assert.equal(validateImport({ name: "A", quantity: "0", price: "0.00" }).length, 0);
  assert.equal(validateImport({ name: " ", quantity: "1.5", price: "-4" }).length, 3);
});
test("crop geometry remains within image at corners, aspect ratios and zoom levels", () => {
  for (const [width, height] of [
    [1200, 800],
    [800, 1200],
  ])
    for (const ratio of [1, 16 / 9, 3 / 4])
      for (const zoom of [1, 2, 3])
        for (const p of [0, 50, 100]) {
          const c = cropBounds(width, height, ratio, zoom, p, p);
          assert.ok(c.x >= 0 && c.y >= 0);
          assert.ok(c.x + c.width <= width + 0.001 && c.y + c.height <= height + 0.001);
          assert.ok(Math.abs(c.width / c.height - ratio) < 0.001);
        }
});
test("time range validation and shared telemetry timestamps", () => {
  const r = exactRange("2026-11-24T08:00", "2026-11-24T09:00");
  assert.equal(r.end - r.start, 3600000);
  assert.throws(() => exactRange("2026-11-24T09:00", "2026-11-24T08:00"), /after/);
  assert.throws(() => exactRange("2026-01-01T00:00", "2026-11-01T00:00"), /31 days/);
  assert.throws(() => exactRange("bad", "bad"));
  const rows = telemetry(r.start, r.end);
  assert.equal(rows[0].time, r.start);
  assert.equal(rows.at(-1).time, r.end);
  assert.ok(rows.every((x) => Number.isFinite(x.cpu) && Number.isFinite(x.latency)));
});
