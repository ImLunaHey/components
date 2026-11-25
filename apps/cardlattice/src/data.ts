export const sets = [
  {
    id: "base-set",
    name: "Base Set",
    year: "1999",
    series: "Original series",
    symbol: "01",
    description:
      "The beginning of a collection. Explore the original Pokémon Trading Card Game release.",
  },
  {
    id: "jungle",
    name: "Jungle",
    year: "1999",
    series: "Original series",
    symbol: "02",
    description: "A world beyond the original 151. Discover the second English expansion.",
  },
  {
    id: "fossil",
    name: "Fossil",
    year: "1999",
    series: "Original series",
    symbol: "03",
    description: "Ancient discoveries, familiar favourites. Explore the Fossil expansion.",
  },
];
export type Printing = {
  id: string;
  cardId: string;
  name: string;
  number: string;
  setId: string;
  language: string;
  rarity: string;
  element: string;
  artist: string | null;
  hp: number;
  finish: string;
};
const examples: [string, string, string, string, string, string | null, number][] = [
  ["Charizard", "004", "base-set", "Fire", "Rare Holo", "Mitsuhiro Arita", 120],
  ["Blastoise", "002", "base-set", "Water", "Rare Holo", "Ken Sugimori", 100],
  ["Venusaur", "015", "base-set", "Grass", "Rare Holo", "Mitsuhiro Arita", 100],
  ["Pikachu", "058", "base-set", "Lightning", "Common", "Mitsuhiro Arita", 40],
  ["Bulbasaur", "044", "base-set", "Grass", "Common", "Mitsuhiro Arita", 40],
  ["Squirtle", "063", "base-set", "Water", "Common", null, 40],
  ["Charmander", "046", "base-set", "Fire", "Common", "Mitsuhiro Arita", 50],
  ["Alakazam", "001", "base-set", "Psychic", "Rare Holo", "Ken Sugimori", 80],
  ["Mewtwo", "010", "base-set", "Psychic", "Rare Holo", null, 60],
  ["Eevee", "051", "jungle", "Colorless", "Common", "Kagemaru Himeno", 50],
  ["Snorlax", "011", "jungle", "Colorless", "Rare Holo", "Ken Sugimori", 90],
  ["Vaporeon", "012", "jungle", "Water", "Rare Holo", null, 80],
  ["Scyther", "010", "jungle", "Grass", "Rare Holo", "Ken Sugimori", 70],
  ["Dragonite", "004", "fossil", "Colorless", "Rare Holo", "Kagemaru Himeno", 100],
  ["Gengar", "005", "fossil", "Psychic", "Rare Holo", "Keiji Kinebuchi", 60],
  ["Lapras", "010", "fossil", "Water", "Rare Holo", null, 80],
  ["Articuno", "002", "fossil", "Water", "Rare Holo", "Mitsuhiro Arita", 70],
];
export const printings: Printing[] = examples.map(
  ([name, number, setId, element, rarity, artist, hp]) => ({
    id: setId + "-" + number,
    cardId: name.toLowerCase(),
    name,
    number,
    setId,
    language: "en-US",
    element,
    rarity,
    artist,
    hp,
    finish: rarity === "Rare Holo" ? "Holofoil" : "Non-holo",
  }),
);
printings.push({ ...printings[0]!, id: "base-set-004-fr", language: "fr", name: "Dracaufeu" });
export const setName = (id: string) => sets.find((set) => set.id === id)?.name ?? id;
export function searchPrintings(query: string) {
  const value = query.trim().toLowerCase();
  return printings.filter((card) =>
    [card.name, card.number, card.cardId, setName(card.setId), card.artist ?? ""].some((field) =>
      field.toLowerCase().includes(value),
    ),
  );
}
export const sampleNotice =
  "Interactive design demo · sample catalogue with card images via TCGdex. Not connected to live Cardlattice data.";

export function filterPrintings(search: Record<string, unknown>, setId?: string) {
  const query = typeof search.q === "string" ? search.q : "";
  return searchPrintings(query)
    .filter(
      (card) =>
        (!(setId || search.set) || card.setId === (setId || search.set)) &&
        (!search.language || card.language === search.language) &&
        (!search.rarity || card.rarity === search.rarity) &&
        (!search.type || card.element === search.type),
    )
    .sort((a, b) =>
      search.sort === "name"
        ? a.name.localeCompare(b.name)
        : a.setId.localeCompare(b.setId) ||
          a.number.localeCompare(b.number) ||
          a.name.localeCompare(b.name),
    );
}
