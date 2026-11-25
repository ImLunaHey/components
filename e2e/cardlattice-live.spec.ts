import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("published Cardlattice snapshot loads without mocks", async ({ page }) => {
  test.skip(
    !process.env.CARDLATTICE_LIVE,
    "Explicit network integration check; normal CI uses published test records.",
  );
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const base = process.env.CARDLATTICE_LIVE_URL ?? "http://127.0.0.1:5634";
  await page.goto(base);
  await expect(page.locator("h1")).toHaveText("Pokémon cards", { timeout: 65000 });
  await expect(page.getByRole("banner")).toContainText("6,773 printings");
  await page.getByRole("searchbox", { name: "Search cards" }).fill("Charizard");
  await page.getByRole("searchbox", { name: "Search cards" }).press("Enter");
  const englishImage = page.getByRole("img", {
    name: "Charizard · 20 · en card artwork",
    exact: true,
  });
  await expect(englishImage).toBeVisible({ timeout: 30000 });
  await expect
    .poll(() => englishImage.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await expect(page.getByText("Finding artwork…", { exact: true })).toHaveCount(0);
  for (const mode of ["dark", "light"] as const)
    for (const width of [390, 1720]) {
      await page.emulateMedia({ colorScheme: mode });
      await page.setViewportSize({ width, height: 1000 });
      await expect(page.getByRole("link", { name: /^Charizard ·/ }).first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(result.violations.map((v) => v.id)).toEqual([]);
      await page.screenshot({
        path: `.runtime/cardlattice-art/after-live-${mode}-${width}.png`,
        fullPage: true,
      });
    }
  await page
    .getByRole("link", { name: /^Charizard ·/ })
    .first()
    .click();
  await expect(page.locator("h1")).toHaveText("Charizard");
  await expect(
    page.getByText("No matching TCGdex artwork is available for this printing."),
  ).toBeVisible();
  await page.goto(base + "/pokemon/printings/pokemon-black-white-boundaries-crossed-en-global-20");
  const detailed = page.getByRole("img", { name: "Charizard · 20 · en card artwork", exact: true });
  await expect(detailed).toHaveAttribute("src", /high.webp$/);
  await expect
    .poll(() => detailed.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await page.screenshot({
    path: ".runtime/cardlattice-art/after-detail-light.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
