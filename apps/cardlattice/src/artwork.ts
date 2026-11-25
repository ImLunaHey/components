import type { Printing } from "./data";
import type { CatalogueRecord } from "./snapshot";
export const tcgdexBase = "https://api.tcgdex.net/v2/";
const languages: Record<string, string> = {
  en: "en",
  ja: "ja",
  nl: "nl",
  ko: "ko",
  "zh-Hans": "zh-cn",
};
export const artworkLanguage = (language: string) => languages[language] ?? null;
export type ArtworkSet = { id: string; name: string; official?: number };
export type ArtworkCard = { id: string; localId: string; name: string; image?: string };
export type ArtworkSetDetails = ArtworkSet & { cards: ArtworkCard[] };
const text = (value: unknown): value is string => typeof value === "string" && value.length > 0;
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("Invalid TCGdex response.");
  return value as Record<string, unknown>;
}
function readSet(value: unknown): ArtworkSet {
  const row = object(value);
  if (!text(row.id) || !text(row.name)) throw Error("Invalid TCGdex set.");
  const count = row.cardCount && object(row.cardCount).official;
  return { id: row.id, name: row.name, official: typeof count === "number" ? count : undefined };
}
export function parseSets(value: unknown): ArtworkSet[] {
  if (!Array.isArray(value)) throw Error("Invalid TCGdex set index.");
  return value.map(readSet);
}
export function parseSet(value: unknown): ArtworkSetDetails {
  const row = object(value),
    set = readSet(value);
  if (!Array.isArray(row.cards)) throw Error("Invalid TCGdex cards.");
  return {
    ...set,
    cards: row.cards.map((value) => {
      const card = object(value);
      if (
        !text(card.id) ||
        !text(card.localId) ||
        !text(card.name) ||
        (card.image != null && !text(card.image))
      )
        throw Error("Invalid TCGdex card.");
      return {
        id: card.id,
        localId: card.localId,
        name: card.name,
        image: card.image as string | undefined,
      };
    }),
  };
}
async function request(path: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(tcgdexBase + path, {
    credentials: "omit",
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(12000)])
      : AbortSignal.timeout(12000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw Error(`TCGdex artwork unavailable (${response.status}).`);
  return response.json();
}
export async function loadArtworkSets(language: string, signal?: AbortSignal) {
  const data = await request(encodeURIComponent(language) + "/sets", signal);
  return data == null ? [] : parseSets(data);
}
export async function loadArtworkSet(language: string, id: string, signal?: AbortSignal) {
  const data = await request(
    `${encodeURIComponent(language)}/sets/${encodeURIComponent(id)}`,
    signal,
  );
  return data == null ? null : parseSet(data);
}
const normalizeName = (value: string) =>
  value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}]/gu, "");
const normalizeNumber = (value: string) =>
  value
    .trim()
    .toLocaleUpperCase("en")
    .replace(/^0+(?=\d)/, "");
/** Require an unambiguous set name or a published, language-specific set code. */
export function matchArtworkSet(
  sets: ArtworkSet[],
  source: CatalogueRecord,
  language: string,
): ArtworkSet | null {
  const names = new Set([source.name, source.name.split("—").at(-1)!].map(normalizeName));
  const identifiers = source.attributes.printedIdentifiers;
  const codes = Array.isArray(identifiers)
    ? identifiers.flatMap((value) => {
        if (!value || typeof value !== "object") return [];
        const entry = value as Record<string, unknown>;
        return entry.language === language && typeof entry.code === "string"
          ? [entry.code.toLowerCase()]
          : [];
      })
    : [];
  const matches = sets.filter(
    (set) => names.has(normalizeName(set.name)) || codes.includes(set.id.toLowerCase()),
  );
  if (matches.length !== 1) return null;
  const match = matches[0]!;
  const denominator = source.attributes.printedDenominator;
  return typeof denominator === "number" && match.official != null && denominator !== match.official
    ? null
    : match;
}
export function matchArtwork(
  card: Pick<Printing, "name" | "number" | "language" | "raw">,
  expectedSet: ArtworkSet,
  set: ArtworkSetDetails,
  language: string,
) {
  if (artworkLanguage(card.language) !== language || set.id !== expectedSet.id) return null;
  const denominator = card.raw.attributes.printedDenominator;
  if (typeof denominator === "number" && set.official != null && denominator !== set.official)
    return null;
  const matches = set.cards.filter(
    (item) => normalizeNumber(item.localId) === normalizeNumber(card.number),
  );
  if (matches.length !== 1) return null;
  const match = matches[0]!;
  if (
    normalizeName(match.name) !== normalizeName(card.name) ||
    !match.image ||
    match.id !== `${set.id}-${match.localId}`
  )
    return null;
  try {
    const url = new URL(match.image);
    const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
    if (
      url.origin !== "https://assets.tcgdex.net" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      parts.length !== 4 ||
      parts[0] !== language ||
      parts[2] !== set.id ||
      normalizeNumber(parts[3]!) !== normalizeNumber(match.localId)
    )
      return null;
    return {
      image: url.href.replace(/\/$/, ""),
      source: `${tcgdexBase}${language}/cards/${encodeURIComponent(match.id)}`,
      id: match.id,
    };
  } catch {
    return null;
  }
}
