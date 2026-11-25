import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { BrowserContext } from "@playwright/test";
export const catalogueBase = "https://cardlattice-status.pages.dev/data/";
export const fixtureBytes = readFileSync(new URL("./fixtures/cardlattice.json", import.meta.url));
export const fixture = JSON.parse(fixtureBytes.toString());
const hash = createHash("sha256").update(fixtureBytes).digest("hex");
export const fixtureManifest = {
  schemaVersion: 1,
  sourceCommit: fixture.sourceCommit,
  filename: `catalogue-${hash}.json`,
  sha256: hash,
  byteSize: fixtureBytes.length,
  counts: fixture.records.reduce(
    (counts: Record<string, number>, record: { metadata: { kind: string } }) => {
      counts[record.metadata.kind] = (counts[record.metadata.kind] ?? 0) + 1;
      return counts;
    },
    {},
  ),
};
export async function mockCatalogue(context: BrowserContext) {
  await context.route(catalogueBase + "**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: route.request().url().endsWith("manifest.json")
        ? JSON.stringify(fixtureManifest)
        : fixtureBytes,
    }),
  );
}
