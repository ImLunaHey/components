import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { artworkLanguage, parseSets, parseSet, matchArtworkSet, matchArtwork } from "./artwork";
import type { Printing } from "./data";
import type { CatalogueRecord } from "./snapshot";
const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL("../../../e2e/fixtures/" + name, import.meta.url), "utf8"));
const data = fixture("cardlattice.json").records as {
  id: string;
  metadata: Omit<CatalogueRecord, "id">;
}[];
const printing = data.find((r) => r.id === "pokemon-black-white-boundaries-crossed-en-global-20")!;
const card = {
  ...printing.metadata,
  id: printing.id,
  number: printing.metadata.collectorNumber,
  raw: { id: printing.id, ...printing.metadata },
} as Pick<Printing, "name" | "number" | "language" | "raw">;
const rawSet = data.find((r) => r.id === card.raw.setId)!;
const source = { id: rawSet.id, ...rawSet.metadata, attributes: rawSet.metadata.attributes ?? {} };
const sets = parseSets(fixture("tcgdex-en-sets.json"));
const detail = parseSet(fixture("tcgdex-en-bw7.json"));
describe("TCGdex artwork matching", () => {
  it("joins a published printing by set, language, collector number and name", () => {
    const set = matchArtworkSet(sets, source, "en")!;
    expect(set.id).toBe("bw7");
    expect(matchArtwork(card, set, detail, "en")).toEqual({
      id: "bw7-20",
      image: "https://assets.tcgdex.net/en/bw/bw7/20",
      source: "https://api.tcgdex.net/v2/en/cards/bw7-20",
    });
    expect(matchArtwork({ ...card, number: "020" }, set, detail, "en")).not.toBeNull();
  });
  it("refuses ambiguous sets and different denominators", () => {
    expect(
      matchArtworkSet([...sets, { id: "other", name: "Boundaries Crossed" }], source, "en"),
    ).toBeNull();
    expect(
      matchArtworkSet(sets, { ...source, attributes: { printedDenominator: 999 } }, "en"),
    ).toBeNull();
    expect(matchArtwork(card, detail, { ...detail, official: 999 }, "en")).toBeNull();
  });
  it("keeps regional language codes and uses only matching-language printed set codes", () => {
    expect(artworkLanguage("zh-Hans")).toBe("zh-cn");
    expect(artworkLanguage("unknown")).toBeNull();
    const source = {
      id: "pokemon-cp3",
      name: "different display name",
      kind: "set",
      attributes: { printedIdentifiers: [{ code: "CP3", language: "ja" }] },
    };
    expect(matchArtworkSet([{ id: "CP3", name: "ポケキュンコレクション" }], source, "ja")?.id).toBe(
      "CP3",
    );
    expect(
      matchArtworkSet([{ id: "CP3", name: "ポケキュンコレクション" }], source, "ko"),
    ).toBeNull();
  });
  it("never substitutes a same-name card from another set, language or number", () => {
    expect(matchArtwork({ ...card, language: "nl" }, detail, detail, "en")).toBeNull();
    expect(matchArtwork(card, { ...detail, id: "base1" }, detail, "en")).toBeNull();
    expect(matchArtwork({ ...card, number: "1" }, detail, detail, "en")).toBeNull();
    expect(matchArtwork({ ...card, number: "20a" }, detail, detail, "en")).toBeNull();
    expect(matchArtwork({ ...card, name: "Charizard ex" }, detail, detail, "en")).toBeNull();
  });
  it("rejects ambiguous records, missing images and foreign asset hosts or languages", () => {
    const row = detail.cards.find((c) => c.localId === "20")!;
    expect(matchArtwork(card, detail, { ...detail, cards: [row, row] }, "en")).toBeNull();
    for (const image of [
      undefined,
      "https://example.com/en/bw/bw7/20",
      "https://assets.tcgdex.net/fr/bw/bw7/20",
      "https://assets.tcgdex.net/en/base/base1/4",
    ]) {
      expect(
        matchArtwork(card, detail, { ...detail, cards: [{ ...row, image }] }, "en"),
      ).toBeNull();
    }
  });
  it("rejects malformed provider payloads", () => {
    expect(() => parseSets({})).toThrow();
    expect(() => parseSet({ id: "bw7", name: "Set", cards: [{ id: 1 }] })).toThrow();
  });
});
