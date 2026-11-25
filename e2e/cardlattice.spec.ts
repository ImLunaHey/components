import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const base = "http://127.0.0.1:5634";
for (const mode of ["light", "dark"] as const)
  for (const width of [390, 1720])
    test(`Cardlattice catalogue routes ${mode} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ colorScheme: mode });
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
  await page.getByRole("searchbox", { name: "Search cards" }).fill("Charizard");
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
  await expect(page.getByRole("status")).toContainText("1–12 of 18");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("13–18 of 18");
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
  await expect(page.getByRole("heading", { name: "Card not found" })).toBeVisible();
  await page.goto(base + "/no-such-page");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("internal links preserve the document across cards, breadcrumbs, tables and history", async ({
  page,
}) => {
  await page.goto(base);
  const documents: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "document") documents.push(request.url());
  });
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await navigation.getByRole("link", { name: "Sets", exact: true }).click();
  await expect(page).toHaveURL(/\/pokemon\/sets(?:\?|$)/);
  await page.getByRole("link", { name: /Base Set/ }).click();
  await expect(page.locator("h1")).toHaveText("Base Set");
  await page.getByRole("link", { name: /^Charizard ·/ }).click();
  await expect(page.locator("h1")).toHaveText("Charizard");
  await page
    .getByRole("navigation", { name: "Breadcrumb", exact: true })
    .getByRole("link", { name: "Base Set", exact: true })
    .click();
  await expect(page.locator("h1")).toHaveText("Base Set");
  await page.getByRole("button", { name: "Table view" }).click();
  await page.getByRole("table").getByRole("link", { name: "Charizard", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Charizard");
  await page.getByRole("link", { name: "Card identity" }).click();
  await expect(page).toHaveURL(/\/pokemon\/cards\/charizard(?:\?|$)/);
  await page.getByRole("link", { name: /^Dracaufeu ·/ }).click();
  await expect(page.locator("h1")).toHaveText("Dracaufeu");
  await page.goBack();
  await expect(page).toHaveURL(/\/pokemon\/cards\/charizard(?:\?|$)/);
  await page.goForward();
  await expect(page.locator("h1")).toHaveText("Dracaufeu");
  await page.getByRole("link", { name: "About this data" }).click();
  await expect(page).toHaveURL(/\/data$/);
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Contribute", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/contribute$/);
  await page.getByRole("contentinfo").getByRole("link", { name: "Coverage", exact: true }).click();
  await expect(page).toHaveURL(/\/coverage$/);
  expect(documents).toEqual([]);
});

test("record links preserve native new-tab navigation", async ({ page }) => {
  await page.goto(base + "/pokemon/sets/base-set");
  const popup = page.context().waitForEvent("page");
  await page.getByRole("link", { name: /^Charizard ·/ }).click({ modifiers: ["ControlOrMeta"] });
  const opened = await popup;
  await expect(opened).toHaveURL(/\/pokemon\/printings\/base-set-004(?:\?|$)/);
  await expect(opened.locator("h1")).toHaveText("Charizard");
  await expect(page).toHaveURL(/\/pokemon\/sets\/base-set(?:\?|$)/);
  await opened.close();
});

test("type and set filters survive inspecting cards and returning to results", async ({ page }) => {
  await page.goto(base);
  await page.getByRole("combobox", { name: "Set", exact: true }).click();
  await page.getByRole("option", { name: "Base Set", exact: true }).click();
  await page.getByRole("combobox", { name: "Type", exact: true }).click();
  await page.getByRole("option", { name: "Fire", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("1–3 of 3");
  await page.getByRole("link", { name: /^Charizard ·/ }).click();
  await expect(page.locator("h1")).toHaveText("Charizard");
  const image = page.getByRole("img", { name: "Charizard · 004 card artwork" });
  await expect(image).toBeVisible();
  expect(
    await image.evaluate(
      (element: HTMLImageElement) => element.complete && element.naturalWidth > 0,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "Next card", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Dracaufeu");
  await page.getByRole("link", { name: "Back to results", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Type", exact: true })).toContainText("Fire");
  await expect(page.getByRole("combobox", { name: "Set", exact: true })).toContainText("Base Set");
  await expect(page.getByRole("status")).toContainText("1–3 of 3");
});

test("mobile filters disclose on demand and card images enlarge accessibly", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto(base);
  await expect(page.getByRole("combobox", { name: "Type", exact: true })).not.toBeVisible();
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByRole("combobox", { name: "Type", exact: true }).click();
  await page.getByRole("option", { name: "Fire", exact: true }).click();
  await page.getByRole("button", { name: /Hide filters/ }).click();
  await page.getByRole("link", { name: /^Charizard ·/ }).click();
  await page.getByRole("button", { name: "Enlarge image" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Enlarge image" })).toBeFocused();
});

test("system theme takes precedence over saved preferences and reacts without navigation", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => localStorage.setItem("luna-theme", "dark"));
  await page.goto(base);
  await expect(page.locator("[data-theme]")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: /Switch to .* mode/ })).toHaveCount(0);
  await page.getByRole("searchbox", { name: "Search cards" }).fill("Pikachu");
  const documents: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "document") documents.push(request.url());
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("[data-theme]")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("searchbox", { name: "Search cards" })).toHaveValue("Pikachu");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("[data-theme]")).toHaveAttribute("data-theme", "light");
  expect(documents).toEqual([]);
});

for (const width of [390, 900, 1720])
  test(`header and result controls align at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base);
    const brand = (await page
      .getByRole("banner")
      .getByRole("link", { name: /cardlattice/ })
      .boundingBox())!;
    const title = (await page.locator("h1").boundingBox())!;
    expect(Math.abs(brand.x - title.x)).toBeLessThan(1);
    const search = (await page.getByRole("search", { name: "Search cards" }).boundingBox())!;
    if (width >= 800)
      expect(Math.abs(brand.y + brand.height / 2 - search.y - search.height / 2)).toBeLessThan(1);
    else expect(Math.abs(search.x - title.x)).toBeLessThan(1);
    const sort = (await page.getByRole("combobox", { name: "Sort", exact: true }).boundingBox())!;
    for (const name of ["Grid view", "Table view"]) {
      const button = (await page.getByRole("button", { name }).boundingBox())!;
      expect(Math.abs(button.y + button.height - sort.y - sort.height)).toBeLessThan(1);
    }
    await page.getByRole("searchbox", { name: "Search cards" }).fill("Pikachu");
    await page.getByRole("searchbox", { name: "Search cards" }).press("Enter");
    await expect(page.getByRole("heading", { name: "Pikachu", exact: true })).toBeVisible();
  });
