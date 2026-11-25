import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const base = "http://127.0.0.1:5634";
for (const mode of ["light", "dark"])
  for (const width of [390, 1720])
    test(`Cardlattice catalogue routes ${mode} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript((mode) => localStorage.setItem("luna-theme", mode), mode);
      for (const [name, path] of [
        ["set", "/pokemon/sets/base-set"],
        ["printing", "/pokemon/printings/base-set-004"],
        ["contribute", "/contribute"],
        ["data", "/data"],
        ["docs", "/docs"],
        ["coverage", "/coverage"],
      ]) {
        await page.goto(base + path);
        await expect(page.locator("h1")).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        const result = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(
          result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        ).toEqual([]);
        await page.screenshot({
          path: `.runtime/cardlattice/after-${name}-${mode}-${width}.png`,
          fullPage: true,
        });
      }
    });
test("search, language filters and back navigation retain the catalogue view", async ({ page }) => {
  await page.goto(base);
  await page.getByRole("searchbox", { name: "Search the catalogue" }).fill("Charizard");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/search\?.*q=Charizard/);
  await page.getByRole("combobox", { name: "Language", exact: true }).click();
  await page.getByRole("option", { name: /French/ }).click();
  await expect(page.getByRole("heading", { name: "Dracaufeu" })).toBeVisible();
  await page.getByRole("link", { name: /Dracaufeu/ }).click();
  await expect(page.locator("h1")).toHaveText("Dracaufeu");
  await page.goBack();
  await expect(page.getByRole("combobox", { name: "Language", exact: true })).toContainText(
    "French",
  );
  await page.getByRole("button", { name: "Table view" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("status")).toContainText("1–8 of 18");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("9–16 of 18");
});
test("corrections are saved and reviewed locally", async ({ page }) => {
  await page.goto(base + "/pokemon/printings/base-set-004");
  await page.getByRole("button", { name: "Suggest a correction" }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "Proposed value" })
    .fill("Sample corrected illustrator");
  await dialog.getByRole("textbox", { name: "Source URL" }).fill("https://example.com/evidence");
  await dialog.getByRole("button", { name: "Submit correction" }).click();
  await expect(dialog.getByRole("status")).toContainText("saved locally");
  await page.keyboard.press("Escape");
  await page.goto(base + "/review");
  await expect(page.getByText("Sample corrected illustrator")).toBeVisible();
  await page.getByRole("button", { name: "Accept in demo" }).click();
  await expect(page.getByText(/Accepted$/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Accepted$/)).toBeVisible();
});
test("snapshot downloads and invalid routes have useful recovery", async ({ page }) => {
  await page.goto(base + "/data");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download demo JSON" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("cardlattice-demo.json");
  const stream = await file.createReadStream();
  const chunks = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const snapshot = JSON.parse(Buffer.concat(chunks).toString());
  expect(snapshot.demo).toBe(true);
  expect(snapshot.printings).toHaveLength(18);
  await page.goto(base + "/pokemon/printings/missing");
  await expect(page.getByRole("heading", { name: "Record not found" })).toBeVisible();
  await page.goto(base + "/no-such-page");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});
