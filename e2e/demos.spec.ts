import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const apps = ["gallery", "projects", "catalogue", "account", "cardlattice", "fleet"];
for (const mode of ["light", "dark"])
  for (const width of [390, 900, 1720])
    for (const [index, name] of apps.entries()) {
      test(`${name} ${mode} ${width}`, async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.setViewportSize({ width, height: 1000 });
        await page.addInitScript((mode) => localStorage.setItem("luna-theme", mode), mode);
        await page.goto(`http://127.0.0.1:${5630 + index}/`);
        await expect(page.locator("h1")).toBeVisible();
        await expect(page.locator("[data-theme]")).toHaveAttribute("data-theme", mode);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(
          results.violations.map((item) => ({
            id: item.id,
            nodes: item.nodes.map((node) => node.target),
          })),
        ).toEqual([]);
        expect(errors).toEqual([]);
        await page.screenshot({
          path: `.runtime/screenshots/after-${name}-${mode}-${width}.png`,
          fullPage: false,
        });
      });
    }
test("gallery keyboard controls, image preview and modal backdrop", async ({ page }) => {
  await page.goto("http://127.0.0.1:5630/forms");
  const language = page.getByRole("combobox", { name: "Language", exact: true });
  await language.click();
  await page.getByRole("combobox", { name: "Search Language" }).fill("Japanese");
  await page.getByRole("option", { name: /Japanese/ }).click();
  await expect(language).toContainText("Japanese");
  await page.getByLabel("Attach file", { exact: true }).setInputFiles({
    name: "image.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="red"/></svg>',
    ),
  });
  await expect(page.getByRole("img", { name: "Preview of image.svg" })).toBeVisible();
  await page.goto("http://127.0.0.1:5630/interactions");
  await page.getByRole("button", { name: "Open dialog" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
