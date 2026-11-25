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
  await mockArtwork(context);
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

export async function mockArtwork(context: BrowserContext) {
  await context.route("https://api.tcgdex.net/v2/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const file =
      path === "/v2/en/sets"
        ? "tcgdex-en-sets.json"
        : path === "/v2/en/sets/bw7"
          ? "tcgdex-en-bw7.json"
          : path === "/v2/en/sets/30th"
            ? "tcgdex-en-30th.json"
            : null;
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: file ? readFileSync(new URL("./fixtures/" + file, import.meta.url)) : "[]",
    });
  });
  await context.route("https://assets.tcgdex.net/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const file = path.startsWith("/en/bw/bw7/20/")
      ? "tcgdex-bw7-20.webp"
      : path.startsWith("/en/me/30th/023/")
        ? "tcgdex-30th-023.webp"
        : null;
    return file
      ? route.fulfill({
          status: 200,
          contentType: "image/webp",
          body: readFileSync(new URL("./fixtures/" + file, import.meta.url)),
        })
      : route.fulfill({ status: 404, body: "Missing" });
  });
}
