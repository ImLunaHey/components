import { useRouterState } from "@tanstack/react-router";
import { RecordLink } from "../../../src/demos/record-link";
import type { Printing } from "./data";
import { setName } from "./data";
import { CardArt } from "./card-art";
export function PrintingTile({ card }: { card: Printing }) {
  const location = useRouterState({ select: (state) => state.location });
  const search = location.search as Record<string, unknown>;
  const context =
    location.pathname.includes("/printings/") || location.pathname.includes("/cards/")
      ? search
      : { origin: location.pathname, browse: search };
  return (
    <RecordLink
      to={"/pokemon/printings/" + card.id}
      search={context}
      aria-label={
        card.name +
        " · " +
        setName(card.setId) +
        " #" +
        card.number +
        " · " +
        (card.language === "fr" ? "French" : "English")
      }
      title={card.name}
      eyebrow={setName(card.setId) + " · " + card.number}
      description={card.rarity + " · " + (card.language === "fr" ? "French" : "English")}
      visual={<CardArt card={card} />}
    />
  );
}
