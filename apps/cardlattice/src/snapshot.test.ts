import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, it, expect } from "vitest";
import { parseManifest, verifySnapshot } from "./snapshot";
import { createCatalogue } from "./data";
const bytes = readFileSync(new URL("../../../e2e/fixtures/cardlattice.json", import.meta.url));
const source = JSON.parse(bytes.toString());
function manifestFor(body: Buffer) {
  const hash = createHash("sha256").update(body).digest("hex");
  return parseManifest({
    schemaVersion: 1,
    sourceCommit: source.sourceCommit,
    filename: `catalogue-${hash}.json`,
    sha256: hash,
    byteSize: body.length,
    counts: source.records.reduce(
      (counts: Record<string, number>, r: { metadata: { kind: string } }) => {
        counts[r.metadata.kind] = (counts[r.metadata.kind] ?? 0) + 1;
        return counts;
      },
      {},
    ),
  });
}
const buffer = (body: Buffer) => Uint8Array.from(body).buffer;
describe("published catalogue integrity", () => {
  it("joins real records, preserves missing fields and uses actual languages", async () => {
    const snapshot = await verifySnapshot(buffer(bytes), manifestFor(bytes));
    const data = createCatalogue(snapshot);
    expect(data.printings).toHaveLength(18);
    expect(data.languages).toEqual(["en", "ja", "ko", "nl", "zh-Hans"]);
    expect(data.filterPrintings({ q: "Charizard", language: "nl" }).map((c) => c.id)).toEqual([
      "pokemon-base-set-nl-global-004",
    ]);
    expect(data.filterPrintings({ q: "Charizard" })).toHaveLength(2);
    expect(data.printings.find((c) => c.id === "pokemon-base-set-nl-global-004")).toMatchObject({
      finish: "holo",
      rarity: "Rare",
      artist: "Mitsuhiro Arita",
    });
    expect(data.sourceRecords).toEqual(source.records);
    expect(data.sets.find((s) => s.id === "pokemon-base-set")?.year).toBeNull();
  });
  it("rejects unsafe manifest filenames and oversized downloads", () => {
    const manifest = manifestFor(bytes);
    expect(() => parseManifest({ ...manifest, filename: "../other.json" })).toThrow();
    expect(() => parseManifest({ ...manifest, byteSize: 30 * 1024 * 1024 })).toThrow();
  });
  it("rejects changed bytes, revisions and record counts", async () => {
    const manifest = manifestFor(bytes);
    const corrupt = Buffer.from(bytes);
    corrupt[100] ^= 1;
    await expect(verifySnapshot(buffer(corrupt), manifest)).rejects.toThrow("checksum");
    await expect(verifySnapshot(buffer(bytes), { ...manifest, byteSize: 1 })).rejects.toThrow(
      "size",
    );
    await expect(
      verifySnapshot(buffer(bytes), { ...manifest, sourceCommit: "a".repeat(40) }),
    ).rejects.toThrow("revision");
    await expect(
      verifySnapshot(buffer(bytes), { ...manifest, counts: { ...manifest.counts, printing: 0 } }),
    ).rejects.toThrow("counts");
  });
  it("rejects duplicate identifiers and broken printing references", async () => {
    const duplicate = structuredClone(source);
    duplicate.records[1].id = duplicate.records[0].id;
    const body = Buffer.from(JSON.stringify(duplicate));
    await expect(verifySnapshot(buffer(body), manifestFor(body))).rejects.toThrow("Duplicate");
    const snapshot = await verifySnapshot(buffer(bytes), manifestFor(bytes));
    snapshot.records.find((r) => r.kind === "printing")!.cardId = "missing";
    expect(() => createCatalogue(snapshot)).toThrow("reference");
  });
});
