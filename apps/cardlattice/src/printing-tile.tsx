import { RecordTile } from "@imlunahey/components/record-tile";
import type { Printing } from "./data";
import { setName } from "./data";
import { CardArt } from "./card-art";
export function PrintingTile({ card }: { card: Printing }) {
  return (
    <RecordTile
      href={"/pokemon/printings/" + card.id}
      title={card.name}
      eyebrow={setName(card.setId) + " · " + card.number}
      description={card.rarity + " · " + (card.language === "fr" ? "French" : "English")}
      visual={<CardArt card={card} />}
    />
  );
}
