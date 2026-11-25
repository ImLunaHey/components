import { MediaImage } from "@imlunahey/components/media-image";
import type { Printing } from "./data";
export function CardArt({ card, eager = false }: { card: Printing; eager?: boolean }) {
  return (
    <MediaImage
      src={"/cards/" + card.id + ".webp"}
      alt={card.name + " · " + card.number + " card artwork"}
      aspectRatio="600 / 825"
      loading={eager ? "eager" : "lazy"}
    />
  );
}
