import type { Snapshot, CatalogueRecord } from "./snapshot";
export type Printing = {
  id: string;
  cardId: string;
  name: string;
  number: string;
  setId: string;
  language: string;
  region: string | null;
  rarity: string | null;
  types: string[];
  element: string | null;
  artist: string | null;
  hp: number | null;
  finish: string | null;
  releaseDate: string | null;
  raw: CatalogueRecord;
  identity: CatalogueRecord;
};
export type CatalogueSet = {
  id: string;
  name: string;
  year: string | null;
  series: string;
  seriesId: string | null;
  releaseDate: string | null;
  count: number;
};
export const number = (value: number) => value.toLocaleString("en");
const strings = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
export function languageName(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}
export function createCatalogue(snapshot: Snapshot) {
  const rows = snapshot.records.filter((r) => r.gameId === "pokemon"),
    byId = new Map(rows.map((r) => [r.id, r]));
  const printings: Printing[] = rows
    .filter((r) => r.kind === "printing")
    .map((raw) => {
      const identity = byId.get(raw.cardId ?? "");
      const set = byId.get(raw.setId ?? "");
      if (!identity || identity.kind !== "card" || !set || set.kind !== "set")
        throw Error("Printing has a missing card or set reference.");
      const types = strings(identity.attributes.types),
        finishes = strings(raw.attributes.finishes),
        artists = strings(raw.attributes.illustrators);
      return {
        id: raw.id,
        cardId: identity.id,
        setId: set.id,
        name: raw.name,
        number: raw.collectorNumber ?? "—",
        language: raw.language ?? "und",
        region: raw.region ?? null,
        rarity: raw.rarity ?? null,
        types,
        element: types.join(" / ") || null,
        artist: artists.join(", ") || null,
        hp: typeof identity.attributes.hp === "number" ? identity.attributes.hp : null,
        finish: finishes.join(", ") || null,
        releaseDate: raw.releaseDate ?? null,
        raw,
        identity,
      };
    });
  const counts = new Map<string, number>();
  for (const card of printings) counts.set(card.setId, (counts.get(card.setId) ?? 0) + 1);
  const sets: CatalogueSet[] = rows
    .filter((r) => r.kind === "set")
    .map((r) => ({
      id: r.id,
      name: r.name,
      year: r.releaseDate?.slice(0, 4) ?? null,
      releaseDate: r.releaseDate ?? null,
      series: r.seriesId
        ? (byId.get(r.seriesId)?.name ?? "Series not recorded")
        : "Series not recorded",
      seriesId: r.seriesId ?? null,
      count: counts.get(r.id) ?? 0,
    }))
    .sort((a, b) => a.series.localeCompare(b.series) || a.name.localeCompare(b.name));
  const names = new Map(sets.map((s) => [s.id, s.name]));
  const setName = (id: string) => names.get(id) ?? id;
  const normalized = (value: string) => value.normalize("NFKC").toLocaleLowerCase("en");
  const searchIndex = new Map(
    printings.map((card) => [
      card.id,
      normalized(
        [card.name, card.number, card.id, setName(card.setId), card.artist ?? ""].join(" "),
      ),
    ]),
  );
  function filterPrintings(search: Record<string, unknown>, setId?: string) {
    const q = normalized(typeof search.q === "string" ? search.q.trim() : "");
    return printings
      .filter(
        (card) =>
          (!q || searchIndex.get(card.id)!.includes(q)) &&
          (!(setId || search.set) || card.setId === (setId || search.set)) &&
          (!search.language || card.language === search.language) &&
          (!search.type || card.types.includes(String(search.type))) &&
          (!search.rarity ||
            (search.rarity === "__missing__" ? !card.rarity : card.rarity === search.rarity)),
      )
      .sort((a, b) =>
        search.sort === "name"
          ? a.name.localeCompare(b.name) || a.id.localeCompare(b.id)
          : setName(a.setId).localeCompare(setName(b.setId)) ||
            a.number.localeCompare(b.number, undefined, { numeric: true }) ||
            a.id.localeCompare(b.id),
      );
  }
  return {
    sets,
    printings,
    setName,
    filterPrintings,
    manifest: snapshot.manifest,
    records: snapshot.records,
    sourceRecords: snapshot.sourceRecords,
    languages: [...new Set(printings.map((card) => card.language))].sort(),
    types: [...new Set(printings.flatMap((card) => card.types))].sort(),
    rarities: [...new Set(printings.flatMap((card) => (card.rarity ? [card.rarity] : [])))].sort(),
  };
}
export type Catalogue = ReturnType<typeof createCatalogue>;
