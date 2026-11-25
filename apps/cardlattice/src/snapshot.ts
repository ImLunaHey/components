export const catalogueBase = "https://cardlattice-status.pages.dev/data/";
export type Manifest = {
  schemaVersion: 1;
  sourceCommit: string;
  filename: string;
  sha256: string;
  byteSize: number;
  counts: Record<string, number>;
};
export type CatalogueRecord = {
  id: string;
  kind: string;
  name: string;
  gameId?: string;
  seriesId?: string;
  setId?: string;
  cardId?: string;
  language?: string;
  region?: string;
  collectorNumber?: string;
  releaseDate?: string;
  rarity?: string;
  attributes: Record<string, unknown>;
};
export type Snapshot = {
  manifest: Manifest;
  records: CatalogueRecord[];
  sourceRecords: { id: string; metadata: Record<string, unknown> }[];
};
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("Invalid catalogue object.");
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  if (typeof value !== "string" || !value.length) throw Error("Invalid catalogue text field.");
  return value;
}
export function parseManifest(value: unknown): Manifest {
  const m = object(value),
    counts = object(m.counts);
  if (
    m.schemaVersion !== 1 ||
    typeof m.sourceCommit !== "string" ||
    !/^[a-f0-9]{40}$/.test(m.sourceCommit) ||
    typeof m.sha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(m.sha256) ||
    m.filename !== `catalogue-${m.sha256}.json` ||
    typeof m.byteSize !== "number" ||
    !Number.isSafeInteger(m.byteSize) ||
    m.byteSize < 1 ||
    m.byteSize > 25 * 1024 * 1024 ||
    Object.values(counts).some((n) => typeof n !== "number" || !Number.isSafeInteger(n) || n < 0)
  )
    throw Error("Invalid catalogue manifest.");
  return m as Manifest;
}
export async function verifySnapshot(bytes: ArrayBuffer, manifest: Manifest): Promise<Snapshot> {
  if (bytes.byteLength !== manifest.byteSize)
    throw Error("Catalogue size does not match its manifest.");
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  if (hash !== manifest.sha256) throw Error("Catalogue checksum does not match its manifest.");
  const bundle = object(JSON.parse(new TextDecoder().decode(bytes)));
  if (
    bundle.schemaVersion !== 1 ||
    bundle.sourceCommit !== manifest.sourceCommit ||
    !Array.isArray(bundle.records)
  )
    throw Error("Catalogue revision or schema does not match its manifest.");
  const records = bundle.records.map((value) => {
    const row = object(value),
      m = object(row.metadata);
    const kind = text(m.kind);
    if (
      !["game", "series", "set", "card", "printing", "product", "collection", "artwork"].includes(
        kind,
      ) ||
      m.synthetic === true
    )
      throw Error("Unsupported catalogue record.");
    const record: CatalogueRecord = {
      id: text(row.id),
      kind,
      name: text(m.name),
      attributes: m.attributes == null ? {} : object(m.attributes),
    };
    for (const key of [
      "gameId",
      "seriesId",
      "setId",
      "cardId",
      "language",
      "region",
      "collectorNumber",
      "releaseDate",
      "rarity",
    ] as const)
      if (m[key] != null) record[key] = text(m[key]);
    return record;
  });
  if (new Set(records.map((r) => r.id)).size !== records.length)
    throw Error("Duplicate catalogue identifiers.");
  const counts: Record<string, number> = {};
  for (const record of records) counts[record.kind] = (counts[record.kind] ?? 0) + 1;
  if (
    Object.keys({ ...counts, ...manifest.counts }).some(
      (kind) => (counts[kind] ?? 0) !== (manifest.counts[kind] ?? 0),
    )
  )
    throw Error("Catalogue counts do not match its manifest.");
  return { manifest, records, sourceRecords: bundle.records as Snapshot["sourceRecords"] };
}
export async function loadSnapshot(signal?: AbortSignal): Promise<Snapshot> {
  const requestSignal = signal
    ? AbortSignal.any([signal, AbortSignal.timeout(30000)])
    : AbortSignal.timeout(30000);
  const response = await fetch(catalogueBase + "manifest.json", {
    signal: requestSignal,
    cache: "no-cache",
    credentials: "omit",
  });
  if (!response.ok) throw Error(`Catalogue manifest unavailable (${response.status}).`);
  const manifest = parseManifest(await response.json());
  const data = await fetch(catalogueBase + manifest.filename, {
    signal: requestSignal,
    credentials: "omit",
  });
  if (!data.ok) throw Error(`Catalogue download unavailable (${data.status}).`);
  return verifySnapshot(await data.arrayBuffer(), manifest);
}
